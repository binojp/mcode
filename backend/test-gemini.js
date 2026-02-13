const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Note: The SDK might not have a direct listModels method on genAI in all versions, 
    // but the error message suggests calling it. 
    // Usually, you fetch it via the client if using the full library, 
    // but with @google/generative-ai, it's sometimes simplified.
    // Let's try to see if it works or if there's another way.
    console.log("Attempting to list models...");
    // The current SDK (0.24.x) might not have a simple listModels on the genAI object.
    // It's usually available in the REST API.
    // Let's try to just test gemini-1.5-flash and gemini-pro.
    const modelsToTest = ["gemini-flash-latest"];
    
    for (const m of modelsToTest) {
      try {
        console.log(`Testing ${m} with v1...`);
        const testModel = genAI.getGenerativeModel({ model: m }, { apiVersion: 'v1' });
        const result = await testModel.generateContent("test");
        const response = await result.response;
        console.log(`Model ${m} is WORKING on v1. Response: ${response.text().substring(0, 20)}...`);
      } catch (e) {
        console.log(`Model ${m} FAILED on v1: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Error in listModels script:", err);
  }
}

listModels();
