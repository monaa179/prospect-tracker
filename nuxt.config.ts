// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    css: ['~/assets/css/tailwind.css'],
    postcss: {
        plugins: {
            '@tailwindcss/postcss': {}
        }
    },
    runtimeConfig: {
        inseeApiKey: process.env.INSEE_API_KEY,
        databaseUrl: process.env.DATABASE_URL
    },
    nitro: {
        experimental: {
            openAPI: true
        }
    }
})
