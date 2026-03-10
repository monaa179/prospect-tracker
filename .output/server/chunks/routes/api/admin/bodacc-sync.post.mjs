import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/prisma.mjs';
import axios from 'axios';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@prisma/client';
import '@prisma/adapter-mariadb';

const RELEVANT_CATEGORIES = {
  "Cr\xE9ations": "real_opening",
  "Ventes et cessions": "takeover",
  "Proc\xE9dures collectives": "closing"
};
const BODACC_API_URL = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records";
class BodaccService {
  /**
   * Fetch BODACC records for a given SIREN number.
   * Returns raw records sorted by dateparution desc.
   */
  static async fetchBodaccRecords(siren) {
    var _a, _b;
    const whereClause = `siren='${siren}'`;
    try {
      console.log(`[BODACC] Fetching records for SIREN ${siren}`);
      const response = await axios.get(BODACC_API_URL, {
        params: {
          where: whereClause,
          limit: 20,
          order_by: "dateparution desc"
        }
      });
      const records = ((_a = response.data) == null ? void 0 : _a.results) || [];
      console.log(`[BODACC] Found ${records.length} records for SIREN ${siren}`);
      return records;
    } catch (error) {
      console.error(`[BODACC] API error for SIREN ${siren}:`, ((_b = error.response) == null ? void 0 : _b.data) || error.message);
      throw new Error(`BODACC API error for SIREN ${siren}: ${error.message}`);
    }
  }
  /**
   * Classify BODACC status by filtering relevant categories,
   * sorting by dateparution desc, and taking the first match.
   *
   * If no relevant record is found → "unknown"
   */
  static classifyBodaccStatus(records) {
    if (!records || records.length === 0) {
      return "unknown";
    }
    const relevant = records.filter((r) => {
      const lib = r.familleavis_lib;
      return lib && lib in RELEVANT_CATEGORIES;
    });
    if (relevant.length === 0) {
      return "unknown";
    }
    relevant.sort((a, b) => {
      const dateA = new Date(a.dateparution).getTime();
      const dateB = new Date(b.dateparution).getTime();
      return dateB - dateA;
    });
    const mostRecent = relevant[0];
    return RELEVANT_CATEGORIES[mostRecent.familleavis_lib] || "unknown";
  }
  /**
   * Full enrichment pipeline for a single establishment:
   * 1. Load from DB
   * 2. Fetch BODACC records
   * 3. Classify
   * 4. Update DB
   */
  static async enrichEstablishmentWithBodacc(establishmentId) {
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId }
    });
    if (!establishment) {
      console.warn(`[BODACC] Establishment #${establishmentId} not found in DB`);
      return;
    }
    try {
      const records = await this.fetchBodaccRecords(establishment.siren);
      const status = this.classifyBodaccStatus(records);
      await prisma.establishment.update({
        where: { id: establishmentId },
        data: {
          bodaccStatus: status,
          bodaccSource: "bodacc",
          bodaccCheckedAt: /* @__PURE__ */ new Date()
        }
      });
      console.log(`[BODACC] Establishment #${establishmentId} (SIREN ${establishment.siren}) \u2192 ${status}`);
    } catch (error) {
      console.error(`[BODACC] Failed to enrich establishment #${establishmentId}:`, error.message);
      await prisma.establishment.update({
        where: { id: establishmentId },
        data: {
          bodaccCheckedAt: /* @__PURE__ */ new Date()
        }
      });
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function runBodaccSync() {
  const sevenDaysAgo = /* @__PURE__ */ new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const establishments = await prisma.establishment.findMany({
    where: {
      OR: [
        { bodaccStatus: null },
        { bodaccCheckedAt: { lt: sevenDaysAgo } }
      ]
    },
    select: { id: true, siren: true, siret: true, name: true },
    orderBy: { createdAt: "desc" }
  });
  const total = establishments.length;
  console.log(`[BODACC-SYNC] Starting sync for ${total} establishments`);
  let processed = 0;
  let failed = 0;
  for (const establishment of establishments) {
    try {
      await BodaccService.enrichEstablishmentWithBodacc(establishment.id);
      processed++;
      console.log(`[BODACC-SYNC] Progress: ${processed + failed}/${total}`);
    } catch (error) {
      failed++;
      console.error(`[BODACC-SYNC] Failed for ${establishment.siret}: ${error.message}`);
    }
    await delay(200);
  }
  console.log(`[BODACC-SYNC] Completed: ${processed} processed, ${failed} failed out of ${total}`);
  return { processed, failed, total };
}

const bodaccSync_post = defineEventHandler(async () => {
  console.log("[ADMIN] Manual BODACC sync triggered");
  try {
    const result = await runBodaccSync();
    return {
      success: true,
      message: `BODACC sync completed: ${result.processed} processed, ${result.failed} failed out of ${result.total}`,
      data: result
    };
  } catch (error) {
    console.error("[ADMIN] BODACC sync error:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error during BODACC sync"
    });
  }
});

export { bodaccSync_post as default };
//# sourceMappingURL=bodacc-sync.post.mjs.map
