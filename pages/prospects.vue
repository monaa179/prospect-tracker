<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Générateur de Prospects Restaurants</h1>
    
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input 
            v-model="city" 
            type="text" 
            placeholder="Ex: Versailles, Lyon..." 
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            @keyup.enter="generateCsv"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <input 
            v-model="withScrape" 
            type="checkbox" 
            id="withScrape"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="withScrape" class="text-sm text-gray-700">
            Forcer le scraping des sites web (plus lent)
          </label>
        </div>

        <button 
          @click="generateCsv" 
          :disabled="isLoading || !city"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isLoading" class="animate-spin">🌀</span>
          {{ isLoading ? 'Génération en cours...' : 'Générer le CSV' }}
        </button>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
        {{ error }}
      </div>
      
      <div v-if="success" class="mt-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
        {{ success }}
      </div>
    </div>

    <div class="prose max-w-none">
      <h2 class="text-xl font-semibold mb-2">Comment ça marche ?</h2>
      <ul class="list-disc list-inside text-gray-600">
        <li>Recherche des restaurants actifs (APE 5610A/B/C) via l'<b>API INSEE</b>.</li>
        <li>Enrichissement des données (site web, téléphone) via <b>OpenStreetMap</b>.</li>
        <li><b>Scraping direct</b> des sites trouvés pour extraire les emails et numéros mobiles (06/07).</li>
        <li>Filtrage automatique des chaînes et restaurants sans contact trouvé.</li>
        <li>Génération d'un fichier CSV encodé pour <b>Excel</b> (BOM UTF-8, séparateur <code>;</code>).</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const city = ref('')
const withScrape = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const generateCsv = async () => {
  if (!city.value) return
  
  isLoading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const params = new URLSearchParams({
      city: city.value,
      withScrape: withScrape.value ? '1' : '0'
    })
    
    // Construct the URL
    const url = `/api/generate-csv?${params.toString()}`
    
    // We use window.location.href for a direct download trigger
    // or fetch if we want more control (but requires handling Blob)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.statusMessage || 'Une erreur est survenue lors de la génération.')
    }
    
    // If it's a JSON response with a message (no prospects found)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      if (data.message) {
        error.value = data.message
        return
      }
    }

    // Trigger download
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', `prospects_${city.value}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    success.value = 'Le fichier CSV a été généré et téléchargé avec succès.'
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Une erreur est survenue.'
  } finally {
    isLoading.value = false
  }
}
</script>
