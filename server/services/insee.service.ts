import axios from 'axios'
import prisma from '../db/prisma'
import { isRealOpening } from '../utils/restaurant.utils'

export interface InseeSearchParams {
    city: string
    since?: string
    address?: string
    limit?: number
    page?: number
}

export class InseeService {
    private static API_BASE_URL = 'https://api.insee.fr/api-sirene/3.11'
    private static API_KEY = process.env.INSEE_API_KEY

    private static getHeaders() {
        return {
            'X-INSEE-Api-Key-Integration': this.API_KEY,
            'Accept': 'application/json'
        }
    }

    /**
     * Convert city name to INSEE commune code via geo.api.gouv.fr
     */
    private static async getCommuneCode(city: string): Promise<string | null> {
        try {
            const response = await axios.get(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(city)}&fields=code,nom&format=json&limit=5`)
            if (response.data && response.data.length > 0) {
                // Try to find exact match first
                const exactMatch = response.data.find((c: any) => c.nom.toLowerCase() === city.toLowerCase())
                return exactMatch ? exactMatch.code : response.data[0].code
            }
            return null
        } catch (error) {
            console.error(`Error fetching commune code for ${city}:`, error)
            return null
        }
    }

    /**
     * Get all commune codes for a city (handles Paris/Lyon/Marseille arrondissements)
     */
    private static getArrondissementCodes(communeCode: string): string[] {
        // Paris: 75056 → 75101..75120
        if (communeCode === '75056') {
            return Array.from({ length: 20 }, (_, i) => String(75101 + i))
        }
        // Lyon: 69123 → 69381..69389
        if (communeCode === '69123') {
            return Array.from({ length: 9 }, (_, i) => String(69381 + i))
        }
        // Marseille: 13055 → 13201..13216
        if (communeCode === '13055') {
            return Array.from({ length: 16 }, (_, i) => String(13201 + i))
        }
        return [communeCode]
    }

    /**
     * Search restaurants for prospects (limited to 100)
     */
    static async searchProspects(city: string) {
        const communeCode = await this.getCommuneCode(city)
        if (!communeCode) {
            throw new Error(`Code commune non trouvé pour la ville : ${city}`)
        }

        const codes = this.getArrondissementCodes(communeCode)
        const communeFilter = codes.length > 1
            ? `(${codes.map(c => `codeCommuneEtablissement:${c}`).join(' OR ')})`
            : `codeCommuneEtablissement:${codes[0]}`

        // Search all establishments (active 'A' and closed 'F')
        const q = `periode(activitePrincipaleEtablissement:(56.10A OR 56.10B OR 56.10C)) AND ${communeFilter}`

        console.log(`[INSEE] Searching prospects for city: ${city} (Code: ${communeCode})`)
        console.log(`[INSEE] Query: ${q}`)

        try {
            const response = await axios.get(`${this.API_BASE_URL}/siret`, {
                headers: this.getHeaders(),
                params: {
                    q,
                    nombre: 100,
                    debut: 0
                }
            })

            const établissements = response.data.etablissements || []
            return établissements.map((et: any) => this.normalizeData(et))
        } catch (error: any) {
            if (error.response?.status === 404) return []
            console.error('[INSEE] API Error:', JSON.stringify(error.response?.data || error.message, null, 2))
            throw error
        }
    }

    /**
     * Search restaurants in Sirene API (auto-paginates to fetch ALL results)
     */
    static async searchRestaurants({ city, since, address }: InseeSearchParams) {
        const communeCode = await this.getCommuneCode(city)
        if (!communeCode) {
            throw new Error(`Code commune non trouvé pour la ville : ${city}`)
        }

        const codes = this.getArrondissementCodes(communeCode)
        const communeFilter = codes.length > 1
            ? `(${codes.map(c => `codeCommuneEtablissement:${c}`).join(' OR ')})`
            : `codeCommuneEtablissement:${codes[0]}`

        // Build query parts - Search all establishments (active 'A' and closed 'F')
        const queryParts: string[] = [
            'periode(activitePrincipaleEtablissement:56.10A OR activitePrincipaleEtablissement:56.10C)',
            communeFilter
        ]

        // Optional date filter
        if (since) {
            queryParts.push(`dateCreationEtablissement:[${since} TO *]`)
        }

        // Optional address filter
        if (address) {
            // Search in street name field
            queryParts.push(`libelleVoieEtablissement:"${address}"`)
        }

        const q = queryParts.join(' AND ')

        const PAGE_SIZE = 1000 // INSEE API max per request
        let debut = 0
        let total = Infinity
        const allResults: any[] = []

        console.log(`[INSEE] Starting paginated fetch: ${q}`)

        while (debut < total) {
            try {
                console.log(`[INSEE] Fetching page at offset ${debut}...`)

                const response = await axios.get(`${this.API_BASE_URL}/siret`, {
                    headers: this.getHeaders(),
                    params: {
                        q,
                        nombre: PAGE_SIZE,
                        debut
                    }
                })

                total = response.data.header?.total || 0
                const établissements = response.data.etablissements || []

                console.log(`[INSEE] Got ${établissements.length} results (total: ${total}, offset: ${debut})`)

                for (const etablissement of établissements) {
                    const normalized = this.normalizeData(etablissement)
                    normalized.isRealOpening = since
                        ? isRealOpening(
                            normalized.dateCreationUniteLegale,
                            normalized.createdAtInsee,
                            normalized.nombrePeriodes,
                            new Date(since)
                        )
                        : false
                    const saved = await this.upsertEstablishment(normalized)
                    allResults.push(saved)
                }

                debut += PAGE_SIZE
            } catch (error: any) {
                // INSEE returns 404 when no results found — this is not an error
                if (error.response?.status === 404) {
                    console.log('[INSEE] No results found for this query')
                    return allResults
                }
                console.error('[INSEE] API Error:', error.response?.data || error.message)
                throw error
            }
        }

        console.log(`[INSEE] Finished: ${allResults.length} total restaurants fetched`)
        return allResults
    }

    /**
     * Get a single restaurant by SIRET
     */
    static async getBySiret(siret: string) {
        // Try local DB first
        let establishment = await prisma.establishment.findUnique({
            where: { siret }
        })

        if (establishment) return establishment

        // If not found, fetch from INSEE
        try {
            const response = await axios.get(`${this.API_BASE_URL}/siret/${siret}`, {
                headers: this.getHeaders()
            })

            const normalized = this.normalizeData(response.data.etablissement)
            return await this.upsertEstablishment(normalized)
        } catch (error: any) {
            if (error.response?.status === 404) return null
            throw error
        }
    }

    private static normalizeData(et: any) {
        const uniteLegale = et.uniteLegale || {}
        const adresse = et.adresseEtablissement || {}
        const designation = uniteLegale.denominationUniteLegale ||
            `${uniteLegale.prenomUsuelUniteLegale || ''} ${uniteLegale.nomUniteLegale || ''}`.trim() ||
            'Inconnu'

        return {
            siret: et.siret,
            siren: et.siren,
            name: designation,
            apeCode: et.uniteLegale?.activitePrincipaleUniteLegale,
            createdAtInsee: et.dateCreationEtablissement ? new Date(et.dateCreationEtablissement) : null,
            dateCreationUniteLegale: uniteLegale.dateCreationUniteLegale ? new Date(uniteLegale.dateCreationUniteLegale) : null,
            nombrePeriodes: et.nombrePeriodesEtablissement ?? null,
            address: `${adresse.numeroVoieEtablissement || ''} ${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}`.trim(),
            postalCode: adresse.codePostalEtablissement,
            city: adresse.libelleCommuneEtablissement,
            communeCode: adresse.codeCommuneEtablissement,
            lastInseeSyncAt: new Date(),
            lastSyncAt: new Date(),
            source: 'insee',
            isRealOpening: false as boolean,
            isActive: et.periodesEtablissement?.[0]?.etatAdministratifEtablissement === 'A'
        }
    }

    private static async upsertEstablishment(data: any) {
        return await prisma.establishment.upsert({
            where: { siret: data.siret },
            update: {
                ...data,
                updatedAt: new Date()
            },
            create: data
        })
    }
}
