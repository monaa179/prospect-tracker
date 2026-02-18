import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()

async function testInseeService() {
    const city = 'Lyon'
    const since = '2025-01-01'

    console.log(`Testing InseeService for city: ${city} since: ${since}...`)

    try {
        // 1. Test Commune Code
        const geoResponse = await axios.get(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(city)}&fields=code&format=json&limit=1`)
        const communeCode = geoResponse.data[0]?.code
        console.log(`Commune Code for ${city}: ${communeCode}`)

        // 2. Test Sirene API with pagination
        const limit = 2
        const page = 1
        const debut = (page - 1) * limit
        const q = `activitePrincipaleEtablissement:(5610A OR 5610C) AND dateCreationEtablissement:[${since} TO *] AND codeCommuneEtablissement:${communeCode}`
        const inseeResponse = await axios.get(`https://portail-api.insee.fr/entreprises/sirene/V3.11/siret`, {
            headers: {
                'X-INSEE-Api-Key-Integration': process.env.INSEE_API_KEY,
                'Accept': 'application/json'
            },
            params: { q, nombre: limit, debut: debut }
        })

        console.log(`Pagination Test - Page ${page}, Limit ${limit}: Found ${inseeResponse.data.etablissements?.length || 0} restaurants.`)
        if (inseeResponse.data.etablissements?.length > 0) {
            console.log('Sample result:', inseeResponse.data.etablissements[0].siret)
        }
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message)
    }
}

testInseeService()
