import axios from 'axios'

export interface PappersDirector {
    nom: string
    prenom: string
    qualite: string // e.g. "Président", "Gérant"
    fullName: string
}

export interface PappersCompanyData {
    directors: PappersDirector[]
    phone: string | null
    website: string | null
}

export class PappersService {
    private static API_BASE_URL = 'https://api.pappers.fr/v2'
    private static API_TOKEN = process.env.PAPPERS_API_TOKEN

    /**
     * Fetch company data from Pappers by SIREN
     */
    static async getCompanyBySiren(siren: string): Promise<PappersCompanyData | null> {
        if (!this.API_TOKEN) {
            console.warn('[Pappers] No API token configured (PAPPERS_API_TOKEN)')
            return null
        }

        try {
            console.log(`[Pappers] Fetching data for SIREN: ${siren}`)

            const response = await axios.get(`${this.API_BASE_URL}/entreprise`, {
                params: {
                    api_token: this.API_TOKEN,
                    siren,
                }
            })

            const data = response.data

            // Extract directors (représentants)
            const representants = data.representants || []
            const directors: PappersDirector[] = representants.map((r: any) => ({
                nom: r.nom || '',
                prenom: r.prenom || '',
                qualite: r.qualite || '',
                fullName: `${r.prenom || ''} ${r.nom || ''}`.trim()
            }))

            // Pappers sometimes includes phone/website at company level
            const phone = data.telephone || null
            const website = data.site_web || null

            console.log(`[Pappers] Found ${directors.length} director(s) for SIREN ${siren}`)

            return { directors, phone, website }
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log(`[Pappers] No company found for SIREN: ${siren}`)
                return null
            }
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.error('[Pappers] Invalid API token or quota exceeded')
                return null
            }
            console.error('[Pappers] API Error:', error.response?.data || error.message)
            throw error
        }
    }

    /**
     * Get the main director (first "Président" or "Gérant", fallback to first representative)
     */
    static getMainDirector(directors: PappersDirector[]): PappersDirector | null {
        if (directors.length === 0) return null

        // Prioritize key roles
        const priorityRoles = ['Président', 'Gérant', 'Directeur général', 'Directeur']
        for (const role of priorityRoles) {
            const found = directors.find(d =>
                d.qualite.toLowerCase().includes(role.toLowerCase())
            )
            if (found) return found
        }

        // Fallback to first representative
        return directors[0]
    }
}
