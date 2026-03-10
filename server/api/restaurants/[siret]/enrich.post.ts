import { PappersService } from '../../../services/pappers.service'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
    const siret = getRouterParam(event, 'siret')

    if (!siret) {
        throw createError({
            statusCode: 400,
            statusMessage: 'SIRET is required'
        })
    }

    // Find the establishment in DB
    const establishment = await prisma.establishment.findUnique({
        where: { siret }
    })

    if (!establishment) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Establishment not found'
        })
    }

    const siren = establishment.siren

    try {
        const updateData: any = {}

        // --- Pappers: fetch director info ---
        const pappersData = await PappersService.getCompanyBySiren(siren)
        if (pappersData) {
            const mainDirector = PappersService.getMainDirector(pappersData.directors)
            if (mainDirector) {
                updateData.directorName = mainDirector.fullName
                updateData.directorRole = mainDirector.qualite
            }
            if (pappersData.phone) {
                updateData.phone = pappersData.phone
            }
            if (pappersData.website) {
                updateData.website = pappersData.website
            }
        }

        // Only update if we got something
        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                message: 'Aucune donnée supplémentaire trouvée',
                data: establishment
            }
        }

        // Update in DB
        const updated = await prisma.establishment.update({
            where: { siret },
            data: {
                ...updateData,
                lastSyncAt: new Date(),
                updatedAt: new Date()
            }
        })

        return {
            success: true,
            message: 'Enrichissement réussi',
            enriched: Object.keys(updateData),
            data: updated
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error enriching establishment'
        })
    }
})
