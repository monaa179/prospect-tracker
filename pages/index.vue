<template>
  <div>
    <!-- Hero -->
    <section class="mb-10">
      <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Radar des nouveaux restaurants
      </h1>
      <p class="mt-2 text-surface-400 text-base">
        Détectez les restaurants récemment immatriculés en France via l'API INSEE Sirene.
      </p>
    </section>

    <!-- Search Form -->
    <form
      @submit.prevent="search"
      class="rounded-2xl border border-white/5 bg-surface-900/60 p-6 backdrop-blur-sm"
    >
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <!-- City -->
        <div>
          <label for="city" class="mb-1.5 block text-sm font-medium text-surface-300">Ville</label>
          <input
            id="city"
            v-model="city"
            type="text"
            placeholder="Paris, Lyon, Marseille…"
            required
            class="w-full rounded-lg border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white placeholder-surface-500 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <!-- Date -->
        <div>
          <label for="since" class="mb-1.5 block text-sm font-medium text-surface-300">Créé depuis</label>
          <input
            id="since"
            v-model="since"
            type="date"
            required
            class="w-full rounded-lg border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <!-- Submit -->
        <div class="flex items-end">
          <button
            type="submit"
            :disabled="pending"
            class="w-full cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:shadow-primary-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!pending">Rechercher</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Recherche…
            </span>
          </button>
        </div>
      </div>

      <!-- Real Opening toggle -->
      <div class="mt-4 flex items-center gap-3">
        <button
          type="button"
          @click="realOnly = !realOnly"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-surface-900',
            realOnly ? 'bg-emerald-500' : 'bg-surface-700'
          ]"
          role="switch"
          :aria-checked="realOnly"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              realOnly ? 'translate-x-5' : 'translate-x-0'
            ]"
          />
        </button>
        <span class="text-sm font-medium text-surface-300">
          Vraies ouvertures uniquement
        </span>
        <span
          v-if="realOnly"
          class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
        >
          Filtre actif
        </span>
      </div>
    </form>

    <!-- Error -->
    <div
      v-if="searchError"
      class="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
    >
      <p class="font-medium">Erreur</p>
      <p class="mt-1 text-red-400">{{ searchError }}</p>
    </div>

    <!-- Loader overlay -->
    <div v-if="pending" class="mt-12 flex flex-col items-center gap-4 text-surface-400">
      <svg class="h-10 w-10 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="text-sm">Interrogation de l'API INSEE…</p>
    </div>

    <!-- Results -->
    <section v-if="!pending && hasSearched" class="mt-8">
      <!-- Count badge + Per Page selector -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-white">Résultats</h2>
          <span class="rounded-full bg-surface-800 px-2.5 py-0.5 text-xs font-medium text-surface-300">
            {{ allRestaurants.length }} restaurant{{ allRestaurants.length > 1 ? 's' : '' }}
          </span>
        </div>
        <div v-if="allRestaurants.length > 0" class="flex items-center gap-2">
          <label for="perPage" class="text-xs text-surface-400">Par page</label>
          <select
            id="perPage"
            v-model.number="perPage"
            @change="currentPage = 1"
            class="rounded-lg border border-white/10 bg-surface-800/80 px-3 py-1.5 text-xs text-white outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-if="allRestaurants.length === 0"
        class="rounded-2xl border border-white/5 bg-surface-900/40 p-12 text-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="mt-4 text-surface-400">Aucun restaurant trouvé pour cette recherche.</p>
        <p class="mt-1 text-sm text-surface-500">Essayez une autre ville ou une date plus ancienne.</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="r in paginatedRestaurants"
          :key="r.siret"
          :to="`/restaurants/${r.siret}`"
          class="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-900/60 p-5 backdrop-blur-sm transition hover:border-primary-500/30 hover:bg-surface-800/60 hover:shadow-xl hover:shadow-primary-500/5"
        >
          <!-- Badges -->
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20">
              {{ r.apeCode || '—' }}
            </span>
            <span
              v-if="r.isRealOpening"
              class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Nouvelle
            </span>
          </div>

          <!-- Name -->
          <h3 class="mt-3 text-base font-semibold text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
            {{ r.name || 'Sans nom' }}
          </h3>

          <!-- Address -->
          <p class="mt-2 text-sm text-surface-400 line-clamp-2">
            {{ formatAddress(r) }}
          </p>

          <!-- Date -->
          <div class="mt-4 flex items-center gap-1.5 text-xs text-surface-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Créé le {{ formatDate(r.createdAtInsee) }}</span>
          </div>

          <!-- Arrow -->
          <div class="absolute right-4 top-1/2 -translate-y-1/2 text-surface-600 transition group-hover:text-primary-400 group-hover:translate-x-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination controls -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1">
        <!-- Prev -->
        <button
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          class="rounded-lg border border-white/10 bg-surface-800/60 px-3 py-2 text-sm text-surface-300 transition hover:bg-surface-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Page numbers -->
        <template v-for="p in visiblePages" :key="p">
          <span v-if="p === '...'" class="px-2 text-sm text-surface-500">…</span>
          <button
            v-else
            @click="goToPage(p as number)"
            :class="[
              'rounded-lg px-3.5 py-2 text-sm font-medium transition',
              currentPage === p
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'border border-white/10 bg-surface-800/60 text-surface-300 hover:bg-surface-700 hover:text-white'
            ]"
          >
            {{ p }}
          </button>
        </template>

        <!-- Next -->
        <button
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          class="rounded-lg border border-white/10 bg-surface-800/60 px-3 py-2 text-sm text-surface-300 transition hover:bg-surface-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Page info -->
        <span class="ml-3 text-xs text-surface-500">
          Page {{ currentPage }} / {{ totalPages }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Persist search state across navigation with useState
const city = useState('search-city', () => '')
const since = useState('search-since', () => '')
const realOnly = useState('search-real-only', () => false)
const hasSearched = useState('search-has-searched', () => false)
const cachedResults = useState<any[]>('search-results', () => [])
const cachedError = useState<string | null>('search-error', () => null)
const currentPage = useState('search-page', () => 1)
const perPage = useState('search-per-page', () => 20)

const pending = ref(false)
const searchError = computed(() => cachedError.value)
const allRestaurants = computed(() => cachedResults.value)

// Pagination
const totalPages = computed(() => Math.ceil(allRestaurants.value.length / perPage.value) || 1)

const paginatedRestaurants = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return allRestaurants.value.slice(start, start + perPage.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})

function goToPage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function search() {
  hasSearched.value = true
  pending.value = true
  cachedError.value = null
  currentPage.value = 1

  try {
    const result = await $fetch<{ success: boolean; count: number; data: any[] }>('/api/restaurants', {
      params: { city: city.value, since: since.value, realOnly: realOnly.value }
    })
    cachedResults.value = result.data || []
  } catch (e: any) {
    cachedError.value = e?.data?.message || e?.message || 'Une erreur est survenue.'
    cachedResults.value = []
  } finally {
    pending.value = false
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatAddress(r: any) {
  const parts = [r.address, r.postalCode, r.city].filter(Boolean)
  return parts.join(', ') || '—'
}
</script>
