import { _ as __nuxt_component_0 } from './nuxt-link-BP0Pyn7x.mjs';
import { mergeProps, withCtx, createVNode, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-surface-950 text-surface-100 font-sans" }, _attrs))}><header class="sticky top-0 z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl"><div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/",
    class: "flex items-center gap-2.5 group"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 transition-shadow group-hover:shadow-primary-500/40"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"${_scopeId}></path></svg></div><span class="text-lg font-semibold tracking-tight text-white"${_scopeId}>Radar Restaurants</span>`);
      } else {
        return [
          createVNode("div", { class: "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 transition-shadow group-hover:shadow-primary-500/40" }, [
            (openBlock(), createBlock("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              class: "h-5 w-5 text-white",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              "stroke-width": "2"
            }, [
              createVNode("path", {
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              })
            ]))
          ]),
          createVNode("span", { class: "text-lg font-semibold tracking-tight text-white" }, "Radar Restaurants")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<span class="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400 ring-1 ring-primary-500/20"><span class="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse"></span> INSEE Live </span></div></header><main class="mx-auto max-w-6xl px-6 py-8">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-CGoBTW9S.mjs.map
