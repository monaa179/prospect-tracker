import { InseeService } from '../../services/insee.service'

export default defineEventHandler(async (event) => {
    const siret = getRouterParam(event, 'siret')

    if (!siret) {
        throw createError({
            statusCode: 400,
            statusMessage: 'SIRET is required'
        })
    }

    try {
        const restaurant = await InseeService.getBySiret(siret)

        if (!restaurant) {
            throw createError({
                statusCode: 404,
                statusMessage: `Restaurant with SIRET ${siret} not found`
            })
        }

        return {
            success: true,
            data: restaurant
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error fetching restaurant'
        })
    }
})
