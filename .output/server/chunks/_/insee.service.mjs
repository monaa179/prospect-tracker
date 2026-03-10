import axios from 'axios';
import { p as prisma } from './prisma.mjs';

function isRealOpening(dateCreationUniteLegale, dateCreationEtablissement, nombrePeriodes, since) {
  if (!dateCreationUniteLegale || !dateCreationEtablissement || nombrePeriodes == null) {
    return false;
  }
  return dateCreationUniteLegale >= since && dateCreationEtablissement >= since && nombrePeriodes === 1;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class InseeService {
  static getHeaders() {
    return {
      "X-INSEE-Api-Key-Integration": this.API_KEY,
      "Accept": "application/json"
    };
  }
  /**
   * Convert city name to INSEE commune code via geo.api.gouv.fr
   */
  static async getCommuneCode(city) {
    try {
      const response = await axios.get(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(city)}&fields=code,nom&format=json&limit=5`);
      if (response.data && response.data.length > 0) {
        const exactMatch = response.data.find((c) => c.nom.toLowerCase() === city.toLowerCase());
        return exactMatch ? exactMatch.code : response.data[0].code;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching commune code for ${city}:`, error);
      return null;
    }
  }
  /**
   * Get all commune codes for a city (handles Paris/Lyon/Marseille arrondissements)
   */
  static getArrondissementCodes(communeCode) {
    if (communeCode === "75056") {
      return Array.from({ length: 20 }, (_, i) => String(75101 + i));
    }
    if (communeCode === "69123") {
      return Array.from({ length: 9 }, (_, i) => String(69381 + i));
    }
    if (communeCode === "13055") {
      return Array.from({ length: 16 }, (_, i) => String(13201 + i));
    }
    return [communeCode];
  }
  /**
   * Search restaurants in Sirene API (auto-paginates to fetch ALL results)
   */
  static async searchRestaurants({ city, since }) {
    var _a, _b, _c;
    const communeCode = await this.getCommuneCode(city);
    if (!communeCode) {
      throw new Error(`Code commune non trouv\xE9 pour la ville : ${city}`);
    }
    const codes = this.getArrondissementCodes(communeCode);
    const communeFilter = codes.length > 1 ? `(${codes.map((c) => `codeCommuneEtablissement:${c}`).join(" OR ")})` : `codeCommuneEtablissement:${codes[0]}`;
    const q = `periode(activitePrincipaleEtablissement:56.10A OR activitePrincipaleEtablissement:56.10C AND etatAdministratifEtablissement:A) AND dateCreationEtablissement:[${since} TO *] AND ${communeFilter}`;
    const PAGE_SIZE = 1e3;
    let debut = 0;
    let total = Infinity;
    const allResults = [];
    console.log(`[INSEE] Starting paginated fetch: ${q}`);
    while (debut < total) {
      try {
        console.log(`[INSEE] Fetching page at offset ${debut}...`);
        const response = await axios.get(`${this.API_BASE_URL}/siret`, {
          headers: this.getHeaders(),
          params: {
            q,
            nombre: PAGE_SIZE,
            debut
          }
        });
        total = ((_a = response.data.header) == null ? void 0 : _a.total) || 0;
        const \u00E9tablissements = response.data.etablissements || [];
        console.log(`[INSEE] Got ${\u00E9tablissements.length} results (total: ${total}, offset: ${debut})`);
        for (const etablissement of \u00E9tablissements) {
          const normalized = this.normalizeData(etablissement);
          normalized.isRealOpening = isRealOpening(
            normalized.dateCreationUniteLegale,
            normalized.createdAtInsee,
            normalized.nombrePeriodes,
            new Date(since)
          );
          const saved = await this.upsertEstablishment(normalized);
          allResults.push(saved);
        }
        debut += PAGE_SIZE;
      } catch (error) {
        if (((_b = error.response) == null ? void 0 : _b.status) === 404) {
          console.log("[INSEE] No results found for this query");
          return allResults;
        }
        console.error("[INSEE] API Error:", ((_c = error.response) == null ? void 0 : _c.data) || error.message);
        throw error;
      }
    }
    console.log(`[INSEE] Finished: ${allResults.length} total restaurants fetched`);
    return allResults;
  }
  /**
   * Get a single restaurant by SIRET
   */
  static async getBySiret(siret) {
    var _a;
    let establishment = await prisma.establishment.findUnique({
      where: { siret }
    });
    if (establishment) return establishment;
    try {
      const response = await axios.get(`${this.API_BASE_URL}/siret/${siret}`, {
        headers: this.getHeaders()
      });
      const normalized = this.normalizeData(response.data.etablissement);
      return await this.upsertEstablishment(normalized);
    } catch (error) {
      if (((_a = error.response) == null ? void 0 : _a.status) === 404) return null;
      throw error;
    }
  }
  static normalizeData(et) {
    var _a, _b;
    const uniteLegale = et.uniteLegale || {};
    const adresse = et.adresseEtablissement || {};
    const designation = uniteLegale.denominationUniteLegale || `${uniteLegale.prenomUsuelUniteLegale || ""} ${uniteLegale.nomUniteLegale || ""}`.trim() || "Inconnu";
    return {
      siret: et.siret,
      siren: et.siren,
      name: designation,
      apeCode: (_a = et.uniteLegale) == null ? void 0 : _a.activitePrincipaleUniteLegale,
      createdAtInsee: et.dateCreationEtablissement ? new Date(et.dateCreationEtablissement) : null,
      dateCreationUniteLegale: uniteLegale.dateCreationUniteLegale ? new Date(uniteLegale.dateCreationUniteLegale) : null,
      nombrePeriodes: (_b = et.nombrePeriodesEtablissement) != null ? _b : null,
      address: `${adresse.numeroVoieEtablissement || ""} ${adresse.typeVoieEtablissement || ""} ${adresse.libelleVoieEtablissement || ""}`.trim(),
      postalCode: adresse.codePostalEtablissement,
      city: adresse.libelleCommuneEtablissement,
      communeCode: adresse.codeCommuneEtablissement,
      lastInseeSyncAt: /* @__PURE__ */ new Date(),
      lastSyncAt: /* @__PURE__ */ new Date(),
      source: "insee",
      isRealOpening: false
    };
  }
  static async upsertEstablishment(data) {
    return await prisma.establishment.upsert({
      where: { siret: data.siret },
      update: {
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      },
      create: data
    });
  }
}
__publicField(InseeService, "API_BASE_URL", "https://api.insee.fr/api-sirene/3.11");
__publicField(InseeService, "API_KEY", process.env.INSEE_API_KEY);

export { InseeService as I };
//# sourceMappingURL=insee.service.mjs.map
