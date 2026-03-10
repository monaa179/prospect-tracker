import { InseeService } from '../services/insee.service'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const city = query.city as string
    const since = (query.since as string) || undefined
    const address = (query.address as string) || undefined
    const realOnly = query.realOnly === 'true'

    if (!city) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Parameter "city" is required.'
        })
    }

    try {
        const restaurants = await InseeService.searchRestaurants({ city, since, address })
        const filtered = realOnly
            ? restaurants.filter((r: any) => r.isRealOpening === true)
            : restaurants

        return {
            success: true,
            count: filtered.length,
            realOnly,
            data: filtered
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error fetching restaurants from INSEE'
        })
    }
})
