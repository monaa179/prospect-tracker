import { d as defineEventHandler, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { I as InseeService } from '../../_/insee.service.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'axios';
import '../../_/prisma.mjs';
import '@prisma/client';
import '@prisma/adapter-mariadb';

const restaurants_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const city = query.city;
  const since = query.since;
  const realOnly = query.realOnly === "true";
  if (!city || !since) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parameters "city" and "since" (YYYY-MM-DD) are required.'
    });
  }
  try {
    const restaurants = await InseeService.searchRestaurants({ city, since });
    const filtered = realOnly ? restaurants.filter((r) => r.isRealOpening === true) : restaurants;
    return {
      success: true,
      count: filtered.length,
      realOnly,
      data: filtered
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error fetching restaurants from INSEE"
    });
  }
});

export { restaurants_get as default };
//# sourceMappingURL=restaurants.get.mjs.map
