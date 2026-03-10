import axios from 'axios'
import { normalizeName, calculateMatchingScore } from '../../utils/prospect.utils'

export interface OsmRestaurant {
    name: string
    website?: string
    phone?: string
    postcode?: string
    lat: number
    lon: number
    brand?: string
}

export class OsmService {
    private static OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
    private static TIMEOUT = 60000 // 60s max

    // Chains to exclude
    private static CHAIN_KEYWORDS = [
        'mcdonald', 'burger king', 'kfc', 'subway', 'starbucks', 'domino', 'pizza hut',
        'hippopotamus', 'courtepaille', 'buffalo grill', 'leon de bruxelles', 'flunch',
        'del arte', 'pizza del arte', 'brioche doree', 'paul', 'la mie caline', 'vengelis'
    ]

    /**
     * Fetch all restaurants in a city using Overpass API
     */
    static async fetchRestaurantsInCity(city: string): Promise<OsmRestaurant[]> {
        const query = `
            [out:json][timeout:60];
            area["name"="${city}"]["admin_level"~"8|9"]->.searchArea;
            (
              node["amenity"="restaurant"](area.searchArea);
              way["amenity"="restaurant"](area.searchArea);
              relation["amenity"="restaurant"](area.searchArea);
              node["amenity"="fast_food"](area.searchArea);
              way["amenity"="fast_food"](area.searchArea);
              relation["amenity"="fast_food"](area.searchArea);
              node["amenity"="cafe"](area.searchArea);
              way["amenity"="cafe"](area.searchArea);
              relation["amenity"="cafe"](area.searchArea);
            );
            out center;
        `

        let attempts = 0
        const maxAttempts = 3
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

        while (attempts < maxAttempts) {
            try {
                console.log(`[OSM] Fetching city-wide restaurants for ${city} (Attempt ${attempts + 1})`)
                const response = await axios.post(this.OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: this.TIMEOUT
                })

                if (!response.data || !response.data.elements) {
                    return []
                }

                return response.data.elements
                    .filter((el: any) => {
                        const tags = el.tags || {}
                        const name = tags.name || ''
                        const brand = tags.brand || ''

                        // Exclude chains
                        if (brand) return false
                        const normName = name.toLowerCase()
                        if (this.CHAIN_KEYWORDS.some(k => normName.includes(k))) return false

                        return !!name
                    })
                    .map((el: any) => {
                        const tags = el.tags || {}
                        return {
                            name: tags.name,
                            website: tags.website || tags['contact:website'],
                            phone: tags.phone || tags['contact:phone'],
                            postcode: tags['addr:postcode'],
                            lat: el.lat || el.center?.lat,
                            lon: el.lon || el.center?.lon,
                            brand: tags.brand
                        }
                    })

            } catch (error: any) {
                attempts++
                const status = error.response?.status
                console.error(`[OSM] Attempt ${attempts} failed: ${status || error.message}`)

                if (attempts >= maxAttempts || (status !== 429 && status !== 504)) {
                    throw error
                }

                // Exponential backoff: 2s, 4s, 8s...
                const waitTime = Math.pow(2, attempts) * 1000
                console.log(`[OSM] Retrying in ${waitTime}ms...`)
                await delay(waitTime)
            }
        }

        return []
    }

    /**
     * Match an INSEE restaurant against the city-wide OSM list
     */
    static findMatch(inseeResto: any, osmList: OsmRestaurant[]): OsmRestaurant | null {
        let bestMatch: OsmRestaurant | null = null
        let bestScore = 0

        for (const osmResto of osmList) {
            const score = calculateMatchingScore(
                {
                    name: inseeResto.name,
                    postcode: inseeResto.postalCode,
                    // INSEE service doesn't seem to provide lat/lon by default, 
                    // but we can add matching based on name and postcode first.
                },
                osmResto
            )

            if (score > bestScore && score >= 50) {
                bestScore = score
                bestMatch = osmResto
            }
        }

        return bestMatch
    }
}
