const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getInsight = async (type, intensity, steps, sleepHours, user) => {
  try {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    
    const prompt = `
      User Profile:
      - Age: ${user.age}
      - Gender: ${user.gender}
      - Activity Level: ${user.activityLevel}
      - Daily Sugar Target: ${user.targetSugar}g
      - Current Streak: ${user.streak} days
      
      Current Event:
      - Consumed: ${type}
      - Intensity (1-5): ${intensity}
      - Time: ${timeOfDay} (${hour}:00)
      - Steps Today: ${steps}
      - Sleep Last Night: ${sleepHours}h

      Task:
      1. Analyze the health impact of this specific sugar event given the context (time, activity, sleep, BMI).
      2. Provide a VERY SHORT, simple "Cause -> Effect" insight (max 15 words).
         Example: "High sugar after low sleep leads to intense afternoon crashes."
      3. Suggest ONE immediate, doable corrective action.

      Format response as JSON:
      {
        "insight": "...",
        "action": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      insight: "Sugar intake affects energy levels.",
      action: "Drink a glass of water."
    };
  }
};

const analyzeImage = async (imageBuffer, mimeType) => {
  try {
    const prompt = `
      Analyze this image of food/drink.
      Identify the main item, estimate its sugar content (high/medium/low), and intensity (1-5).
      Format response as JSON:
      {
        "item": "...",
        "sugarLevel": "...",
        "intensity": 3
      }
    `;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Image Error:", error);
    return {
      item: "Image Log",
      intensity: 3
    };
  }
};

const analyzeAudio = async (audioBuffer, mimeType) => {
   // Gemini 1.5 Flash supports audio directly
    try {
        const prompt = `
        Listen to this audio log of a food item.
        Extract the food item name and estimated sugar intensity (1-5).
        Format response as JSON:
        {
            "item": "...",
            "intensity": 3
        }
        `;

        const audioPart = {
            inlineData: {
                data: audioBuffer.toString("base64"),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, audioPart]);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini Audio Error:", error);
        return {
            item: "Audio Log",
            intensity: 3
        };
    }
}

const analyzeText = async (text) => {
    try {
        const prompt = `
        Analyze this text description of a food/sugar item.
        Extract the food item name and estimated sugar intensity (1-5).
        Input: "${text}"
        Format response as JSON:
        {
            "item": "...",
            "intensity": 3
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let resultText = response.text();
        resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(resultText);

    } catch (error) {
        console.error("Gemini Text Error:", error);
        return {
            item: text || "Text Log",
            intensity: 3
        };
    }
}

module.exports = { getInsight, analyzeImage, analyzeAudio, analyzeText };
