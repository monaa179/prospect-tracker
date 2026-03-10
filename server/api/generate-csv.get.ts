import { stringify } from 'csv-stringify/sync'
import iconv from 'iconv-lite'
import { InseeService } from '../services/insee.service'
import { OsmService } from '../services/osm.service'
import { ScraperService } from '../services/scraper.service'
import { getContactStrength, normalizePhone, isMobile } from '../../utils/prospect.utils'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const query = getQuery(event)
    const city = query.city as string
    const withScrapeParam = query.withScrape

    if (!city) {
        throw createError({
            statusCode: 400,
            statusMessage: 'City parameter is required (?city=Versailles)'
        })
    }

    try {
        // 1. Fetch from INSEE (limit 100)
        const inseeProspects = await InseeService.searchProspects(city)
        if (inseeProspects.length === 0) {
            return { message: 'No restaurants found in this city via INSEE.' }
        }

        // 2. Fetch all from OSM for this city (Single call)
        const osmRestaurants = await OsmService.fetchRestaurantsInCity(city)
        console.log(`[API] Found ${osmRestaurants.length} restaurants in OSM for ${city}`)

        // 3. Match and Enrich
        let enrichedProspects = inseeProspects.map(insee => {
            const osmMatch = OsmService.findMatch(insee, osmRestaurants)
            return {
                ...insee,
                website: osmMatch?.website || '',
                osmPhone: osmMatch?.phone || '',
                emails: [] as string[],
                mobile_phone: ''
            }
        })

        // 4. Scraping logic
        const sitesToScrape = enrichedProspects
            .filter(p => p.website)
            .map(p => p.website)

        // Decide whether to scrape
        const shouldScrape = withScrapeParam === '1' || (withScrapeParam !== '0' && sitesToScrape.length <= 30)

        if (shouldScrape && sitesToScrape.length > 0) {
            console.log(`[API] Scraping ${sitesToScrape.length} websites...`)
            const scrapeResults = await ScraperService.scrapeBatch(sitesToScrape)

            enrichedProspects = enrichedProspects.map(p => {
                if (p.website && scrapeResults.has(p.website)) {
                    const data = scrapeResults.get(p.website)!
                    const osmMobile = normalizePhone(p.osmPhone)
                    const finalMobile = data.mobiles[0] || (isMobile(osmMobile) ? osmMobile : '') || ''
                    return {
                        ...p,
                        emails: data.emails,
                        mobile_phone: finalMobile
                    }
                }
                const osmMobile = normalizePhone(p.osmPhone)
                return {
                    ...p,
                    mobile_phone: isMobile(osmMobile) ? osmMobile! : ''
                }
            })
        } else {
            console.log(`[API] Skipping scraping (sites: ${sitesToScrape.length}, shouldScrape: ${shouldScrape})`)
            enrichedProspects = enrichedProspects.map(p => {
                const osmMobile = normalizePhone(p.osmPhone)
                return {
                    ...p,
                    mobile_phone: isMobile(osmMobile) ? osmMobile! : ''
                }
            })
        }

        // 5. Business Logic: Filter and Final Mapping
        const finalProspects = enrichedProspects
            .filter(p => p.emails.length > 0 || p.mobile_phone) // Keep if email or mobile found
            .slice(0, 50) // Limit to 50 as requested
            .map(p => ({
                name: p.name,
                address: p.address,
                postcode: p.postalCode,
                city: p.city,
                siret: p.siret,
                website: p.website,
                mobile_phone: p.mobile_phone,
                emails: p.emails.join(', '),
                contact_strength: getContactStrength(p.emails, p.mobile_phone ? [p.mobile_phone] : [])
            }))

        if (finalProspects.length === 0) {
            return { message: 'No prospects with contact info found.' }
        }

        // 6. Generate CSV
        const csvContent = stringify(finalProspects, {
            header: true,
            delimiter: ';',
            columns: [
                'name', 'address', 'postcode', 'city', 'siret', 'website', 'mobile_phone', 'emails', 'contact_strength'
            ]
        })

        // Encode to UTF-8 with BOM for Excel
        const csvBuffer = iconv.encode(csvContent, 'utf8', { addBOM: true })

        // 7. Set Headers and Return
        setResponseHeaders(event, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="prospects_${encodeURIComponent(city)}.csv"`
        })

        return csvBuffer

    } catch (error: any) {
        const errorData = error.response?.data
        console.error('[API] Error:', JSON.stringify(errorData || error.message || error, null, 2))
        throw createError({
            statusCode: error.response?.status || 500,
            statusMessage: 'Error: ' + (errorData?.header?.message || error.message)
        })
    }
})
