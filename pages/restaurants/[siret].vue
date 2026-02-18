<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-1.5 text-sm text-surface-400 transition hover:text-primary-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Retour à la recherche
    </NuxtLink>

    <!-- Loading -->
    <div v-if="pending" class="mt-16 flex flex-col items-center gap-4 text-surface-400">
      <svg class="h-10 w-10 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="text-sm">Chargement de la fiche…</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center"
    >
      <p class="font-medium text-red-300">Impossible de charger ce restaurant</p>
      <p class="mt-1 text-sm text-red-400">{{ error.message }}</p>
    </div>

    <!-- Detail card -->
    <div v-else-if="restaurant" class="mt-6">
      <!-- Header -->
      <div class="rounded-2xl border border-white/5 bg-surface-900/60 p-6 backdrop-blur-sm sm:p-8">
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span class="inline-flex items-center rounded-md bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20">
              {{ restaurant.apeCode || '—' }}
            </span>
            <h1 class="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {{ restaurant.name || 'Sans nom' }}
            </h1>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset"
            :class="statusClasses"
          >
            {{ statusLabel }}
          </span>
        </div>

        <!-- Info grid -->
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="SIRET" :value="restaurant.siret" />
          <InfoItem label="SIREN" :value="restaurant.siren" />
          <InfoItem label="Date de création" :value="formatDate(restaurant.createdAtInsee)" />
          <InfoItem label="Code APE" :value="restaurant.apeCode" />
          <InfoItem label="Code commune" :value="restaurant.communeCode" />
          <InfoItem label="Source" :value="restaurant.source" />
        </div>

        <!-- Address block -->
        <div class="mt-8 rounded-xl border border-white/5 bg-surface-800/40 p-5">
          <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">Adresse complète</h3>
          <p class="text-sm text-white leading-relaxed">
            {{ restaurant.address || '—' }}<br />
            {{ restaurant.postalCode }} {{ restaurant.city }}
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex flex-wrap gap-3">
          <button
            disabled
            class="inline-flex items-center gap-2 rounded-lg bg-surface-800 px-5 py-2.5 text-sm font-medium text-surface-400 ring-1 ring-white/5 cursor-not-allowed opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Enrichir (Pappers)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const siret = route.params.siret as string

const { data, pending, error } = useAsyncData(`restaurant-${siret}`, () =>
  $fetch(`/api/restaurants/${siret}`)
)

const restaurant = computed(() => data.value?.data || null)

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    NEW: 'Nouveau',
    CONTACTED: 'Contacté',
    INTERESTED: 'Intéressé',
    CONVERTED: 'Converti',
    REJECTED: 'Rejeté'
  }
  return map[restaurant.value?.contactStatus] || 'Nouveau'
})

const statusClasses = computed(() => {
  const s = restaurant.value?.contactStatus || 'NEW'
  const m: Record<string, string> = {
    NEW: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    CONTACTED: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    INTERESTED: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    CONVERTED: 'bg-green-500/10 text-green-400 ring-green-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 ring-red-500/20'
  }
  return m[s] || m.NEW
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// InfoItem inline component
const InfoItem = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: String, default: null }
  },
  setup(props) {
    return () =>
      h('div', [
        h('dt', { class: 'text-xs font-semibold uppercase tracking-wider text-surface-500' }, props.label),
        h('dd', { class: 'mt-1 text-sm font-medium text-white' }, props.value || '—')
      ])
  }
})
</script>
