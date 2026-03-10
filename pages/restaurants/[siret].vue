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
    <div v-else-if="restaurant" class="mt-6 space-y-6">
      <!-- Header -->
      <div class="rounded-2xl border border-white/5 bg-surface-900/60 p-6 backdrop-blur-sm sm:p-8">
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span class="inline-flex items-center rounded-md bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20">
              {{ apeLabel(restaurant.apeCode) }}
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
          <InfoItem label="Activité" :value="apeLabel(restaurant.apeCode)" />
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
      </div>

      <!-- Director & Contact card -->
      <div class="rounded-2xl border border-white/5 bg-surface-900/60 p-6 backdrop-blur-sm sm:p-8">
        <h2 class="mb-5 text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Dirigeant & Contact
        </h2>

        <!-- Director info -->
        <div v-if="restaurant.directorName" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wider text-surface-500">Dirigeant</dt>
            <dd class="mt-1 text-sm font-medium text-white">{{ restaurant.directorName }}</dd>
          </div>
          <div v-if="restaurant.directorRole">
            <dt class="text-xs font-semibold uppercase tracking-wider text-surface-500">Fonction</dt>
            <dd class="mt-1 text-sm font-medium text-white">{{ restaurant.directorRole }}</dd>
          </div>
          <div v-if="restaurant.phone">
            <dt class="text-xs font-semibold uppercase tracking-wider text-surface-500">Téléphone</dt>
            <dd class="mt-1">
              <a
                :href="'tel:' + restaurant.phone"
                class="text-sm font-medium text-primary-400 hover:text-primary-300 transition"
              >
                {{ restaurant.phone }}
              </a>
            </dd>
          </div>
          <div v-if="restaurant.website">
            <dt class="text-xs font-semibold uppercase tracking-wider text-surface-500">Site web</dt>
            <dd class="mt-1">
              <a
                :href="restaurant.website.startsWith('http') ? restaurant.website : 'https://' + restaurant.website"
                target="_blank"
                rel="noopener"
                class="text-sm font-medium text-primary-400 hover:text-primary-300 transition"
              >
                {{ restaurant.website }}
              </a>
            </dd>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="rounded-xl border border-white/5 bg-surface-800/40 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-8 w-8 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p class="mt-3 text-sm text-surface-400">Aucune donnée dirigeant disponible</p>
          <p class="mt-1 text-xs text-surface-500">Cliquez sur « Enrichir » pour rechercher le dirigeant via Pappers</p>
        </div>

        <!-- Enrich button -->
        <div class="mt-6">
          <button
            @click="enrichEstablishment"
            :disabled="enriching"
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition hover:shadow-primary-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg v-if="!enriching" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <svg v-else class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ enriching ? 'Enrichissement…' : 'Enrichir (Pappers)' }}
          </button>
        </div>

        <!-- Enrich result message -->
        <div v-if="enrichMessage" class="mt-4 rounded-lg p-3 text-sm" :class="enrichSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
          {{ enrichMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const siret = route.params.siret as string

const { data, pending, error, refresh } = useAsyncData(`restaurant-${siret}`, () =>
  $fetch(`/api/restaurants/${siret}`)
)

const restaurant = computed(() => data.value?.data || null)

// Enrich state
const enriching = ref(false)
const enrichMessage = ref('')
const enrichSuccess = ref(false)

async function enrichEstablishment() {
  enriching.value = true
  enrichMessage.value = ''

  try {
    const result = await $fetch<{ success: boolean; message: string; enriched?: string[] }>(`/api/restaurants/${siret}/enrich`, {
      method: 'POST'
    })

    enrichSuccess.value = result.success
    if (result.success && result.enriched) {
      enrichMessage.value = `${result.message} — champs enrichis : ${result.enriched.join(', ')}`
    } else {
      enrichMessage.value = result.message
    }

    // Refresh the data to show updated fields
    await refresh()
  } catch (e: any) {
    enrichSuccess.value = false
    enrichMessage.value = e?.data?.message || e?.message || 'Erreur lors de l\'enrichissement'
  } finally {
    enriching.value = false
  }
}

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
