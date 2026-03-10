import { _ as __nuxt_component_0 } from './nuxt-link-BP0Pyn7x.mjs';
import { defineComponent, ref, computed, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, createCommentVNode, toRef, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useNuxtApp } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const city = useState("search-city", () => "");
    const since = useState("search-since", () => "");
    const realOnly = useState("search-real-only", () => false);
    const hasSearched = useState("search-has-searched", () => false);
    const cachedResults = useState("search-results", () => []);
    const cachedError = useState("search-error", () => null);
    const currentPage = useState("search-page", () => 1);
    const perPage = useState("search-per-page", () => 20);
    const pending = ref(false);
    const searchError = computed(() => cachedError.value);
    const allRestaurants = computed(() => cachedResults.value);
    const totalPages = computed(() => Math.ceil(allRestaurants.value.length / perPage.value) || 1);
    const paginatedRestaurants = computed(() => {
      const start = (currentPage.value - 1) * perPage.value;
      return allRestaurants.value.slice(start, start + perPage.value);
    });
    const visiblePages = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const pages = [];
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
      }
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
      return pages;
    });
    function formatDate(dateStr) {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
    function formatAddress(r) {
      const parts = [r.address, r.postalCode, r.city].filter(Boolean);
      return parts.join(", ") || "—";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><section class="mb-10"><h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl"> Radar des nouveaux restaurants </h1><p class="mt-2 text-surface-400 text-base"> Détectez les restaurants récemment immatriculés en France via l&#39;API INSEE Sirene. </p></section><form class="rounded-2xl border border-white/5 bg-surface-900/60 p-6 backdrop-blur-sm"><div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><div><label for="city" class="mb-1.5 block text-sm font-medium text-surface-300">Ville</label><input id="city"${ssrRenderAttr("value", unref(city))} type="text" placeholder="Paris, Lyon, Marseille…" required class="w-full rounded-lg border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white placeholder-surface-500 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"></div><div><label for="since" class="mb-1.5 block text-sm font-medium text-surface-300">Créé depuis</label><input id="since"${ssrRenderAttr("value", unref(since))} type="date" required class="w-full rounded-lg border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"></div><div class="flex items-end"><button type="submit"${ssrIncludeBooleanAttr(unref(pending)) ? " disabled" : ""} class="w-full cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:shadow-primary-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">`);
      if (!unref(pending)) {
        _push(`<span>Rechercher</span>`);
      } else {
        _push(`<span class="flex items-center justify-center gap-2"><svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Recherche… </span>`);
      }
      _push(`</button></div></div><div class="mt-4 flex items-center gap-3"><button type="button" class="${ssrRenderClass([
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-surface-900",
        unref(realOnly) ? "bg-emerald-500" : "bg-surface-700"
      ])}" role="switch"${ssrRenderAttr("aria-checked", unref(realOnly))}><span class="${ssrRenderClass([
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        unref(realOnly) ? "translate-x-5" : "translate-x-0"
      ])}"></span></button><span class="text-sm font-medium text-surface-300"> Vraies ouvertures uniquement </span>`);
      if (unref(realOnly)) {
        _push(`<span class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"> Filtre actif </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></form>`);
      if (unref(searchError)) {
        _push(`<div class="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"><p class="font-medium">Erreur</p><p class="mt-1 text-red-400">${ssrInterpolate(unref(searchError))}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="mt-12 flex flex-col items-center gap-4 text-surface-400"><svg class="h-10 w-10 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><p class="text-sm">Interrogation de l&#39;API INSEE…</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(pending) && unref(hasSearched)) {
        _push(`<section class="mt-8"><div class="mb-5 flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-3"><h2 class="text-lg font-semibold text-white">Résultats</h2><span class="rounded-full bg-surface-800 px-2.5 py-0.5 text-xs font-medium text-surface-300">${ssrInterpolate(unref(allRestaurants).length)} restaurant${ssrInterpolate(unref(allRestaurants).length > 1 ? "s" : "")}</span></div>`);
        if (unref(allRestaurants).length > 0) {
          _push(`<div class="flex items-center gap-2"><label for="perPage" class="text-xs text-surface-400">Par page</label><select id="perPage" class="rounded-lg border border-white/10 bg-surface-800/80 px-3 py-1.5 text-xs text-white outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"><option${ssrRenderAttr("value", 20)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 20) : ssrLooseEqual(unref(perPage), 20)) ? " selected" : ""}>20</option><option${ssrRenderAttr("value", 50)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 50) : ssrLooseEqual(unref(perPage), 50)) ? " selected" : ""}>50</option><option${ssrRenderAttr("value", 100)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 100) : ssrLooseEqual(unref(perPage), 100)) ? " selected" : ""}>100</option></select></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(allRestaurants).length === 0) {
          _push(`<div class="rounded-2xl border border-white/5 bg-surface-900/40 p-12 text-center"><svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><p class="mt-4 text-surface-400">Aucun restaurant trouvé pour cette recherche.</p><p class="mt-1 text-sm text-surface-500">Essayez une autre ville ou une date plus ancienne.</p></div>`);
        } else {
          _push(`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(paginatedRestaurants), (r) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: r.siret,
              to: `/restaurants/${r.siret}`,
              class: "group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-900/60 p-5 backdrop-blur-sm transition hover:border-primary-500/30 hover:bg-surface-800/60 hover:shadow-xl hover:shadow-primary-500/5"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-center gap-2"${_scopeId}><span class="inline-flex items-center rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20"${_scopeId}>${ssrInterpolate(r.apeCode || "—")}</span>`);
                  if (r.isRealOpening) {
                    _push2(`<span class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"${_scopeId}></path></svg> Nouvelle </span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><h3 class="mt-3 text-base font-semibold text-white line-clamp-2 group-hover:text-primary-300 transition-colors"${_scopeId}>${ssrInterpolate(r.name || "Sans nom")}</h3><p class="mt-2 text-sm text-surface-400 line-clamp-2"${_scopeId}>${ssrInterpolate(formatAddress(r))}</p><div class="mt-4 flex items-center gap-1.5 text-xs text-surface-500"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"${_scopeId}></path></svg><span${_scopeId}>Créé le ${ssrInterpolate(formatDate(r.createdAtInsee))}</span></div><div class="absolute right-4 top-1/2 -translate-y-1/2 text-surface-600 transition group-hover:text-primary-400 group-hover:translate-x-0.5"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"${_scopeId}></path></svg></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode("span", { class: "inline-flex items-center rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20" }, toDisplayString(r.apeCode || "—"), 1),
                      r.isRealOpening ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                      }, [
                        (openBlock(), createBlock("svg", {
                          xmlns: "http://www.w3.org/2000/svg",
                          class: "h-3 w-3",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                          "stroke-width": "2.5"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M5 13l4 4L19 7"
                          })
                        ])),
                        createTextVNode(" Nouvelle ")
                      ])) : createCommentVNode("", true)
                    ]),
                    createVNode("h3", { class: "mt-3 text-base font-semibold text-white line-clamp-2 group-hover:text-primary-300 transition-colors" }, toDisplayString(r.name || "Sans nom"), 1),
                    createVNode("p", { class: "mt-2 text-sm text-surface-400 line-clamp-2" }, toDisplayString(formatAddress(r)), 1),
                    createVNode("div", { class: "mt-4 flex items-center gap-1.5 text-xs text-surface-500" }, [
                      (openBlock(), createBlock("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        class: "h-3.5 w-3.5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        "stroke-width": "2"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        })
                      ])),
                      createVNode("span", null, "Créé le " + toDisplayString(formatDate(r.createdAtInsee)), 1)
                    ]),
                    createVNode("div", { class: "absolute right-4 top-1/2 -translate-y-1/2 text-surface-600 transition group-hover:text-primary-400 group-hover:translate-x-0.5" }, [
                      (openBlock(), createBlock("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        class: "h-5 w-5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        "stroke-width": "2"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          d: "M9 5l7 7-7 7"
                        })
                      ]))
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        }
        if (unref(totalPages) > 1) {
          _push(`<div class="mt-8 flex items-center justify-center gap-1"><button${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} class="rounded-lg border border-white/10 bg-surface-800/60 px-3 py-2 text-sm text-surface-300 transition hover:bg-surface-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button><!--[-->`);
          ssrRenderList(unref(visiblePages), (p) => {
            _push(`<!--[-->`);
            if (p === "...") {
              _push(`<span class="px-2 text-sm text-surface-500">…</span>`);
            } else {
              _push(`<button class="${ssrRenderClass([
                "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                unref(currentPage) === p ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "border border-white/10 bg-surface-800/60 text-surface-300 hover:bg-surface-700 hover:text-white"
              ])}">${ssrInterpolate(p)}</button>`);
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--><button${ssrIncludeBooleanAttr(unref(currentPage) === unref(totalPages)) ? " disabled" : ""} class="rounded-lg border border-white/10 bg-surface-800/60 px-3 py-2 text-sm text-surface-300 transition hover:bg-surface-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button><span class="ml-3 text-xs text-surface-500"> Page ${ssrInterpolate(unref(currentPage))} / ${ssrInterpolate(unref(totalPages))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BL3ezJ61.mjs.map
