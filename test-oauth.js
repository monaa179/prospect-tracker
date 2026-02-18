import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testApi() {
  try {
    const response = await axios.get(
      "https://api.insee.fr/api-sirene/3.11/siren/siren/552100554)",
      {
        headers: {
          "X-INSEE-Api-Key-Integration": process.env.INSEE_API_KEY,
        },
      }
    );

    console.log("✅ API OK");
    console.log(response.data);
  } catch (error) {
    console.error("❌ ERREUR");
    console.error(error.response?.data || error.message);
  }
}

testApi();
