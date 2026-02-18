import { InseeService } from '../services/insee.service'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const city = query.city as string
    const since = query.since as string
    const realOnly = query.realOnly === 'true'

    if (!city || !since) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Parameters "city" and "since" (YYYY-MM-DD) are required.'
        })
    }

    try {
        const restaurants = await InseeService.searchRestaurants({ city, since })
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
