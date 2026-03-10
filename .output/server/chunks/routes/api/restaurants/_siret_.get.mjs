import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../nitro/nitro.mjs';
import { I as InseeService } from '../../../_/insee.service.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'axios';
import '../../../_/prisma.mjs';
import '@prisma/client';
import '@prisma/adapter-mariadb';

const _siret__get = defineEventHandler(async (event) => {
  const siret = getRouterParam(event, "siret");
  if (!siret) {
    throw createError({
      statusCode: 400,
      statusMessage: "SIRET is required"
    });
  }
  try {
    const restaurant = await InseeService.getBySiret(siret);
    if (!restaurant) {
      throw createError({
        statusCode: 404,
        statusMessage: `Restaurant with SIRET ${siret} not found`
      });
    }
    return {
      success: true,
      data: restaurant
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error fetching restaurant"
    });
  }
});

export { _siret__get as default };
//# sourceMappingURL=_siret_.get.mjs.map
