<template>
  <div class="min-h-screen bg-surface-950 text-surface-100 font-sans">
    <!-- Nav -->
    <header class="sticky top-0 z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 transition-shadow group-hover:shadow-primary-500/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <span class="text-lg font-semibold tracking-tight text-white">Radar Restaurants</span>
        </NuxtLink>
        <span class="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400 ring-1 ring-primary-500/20">
          <span class="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse"></span>
          INSEE Live
        </span>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-6xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
