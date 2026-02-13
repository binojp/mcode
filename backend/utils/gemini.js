const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const getInsight = async (type, intensity, steps, sleepHours, user) => {
  try {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    
    const prompt = `
      User Profile:
      - Age: ${user.age}
      - Gender: ${user.gender}
      - BMI: ${user.bmi || 'Not calculated'}
      - Activity Level: ${user.activityLevel}
      - Daily Sugar Target: ${user.targetSugar}g
      
      Current Health Context:
      - Steps Today: ${steps}
      - Sleep Last Night: ${sleepHours}h
      - Time of Day: ${timeOfDay} (${hour}:00)

      Event: ${type} (Intensity: ${intensity}/5)

      Task:
      1. Analyze impact based on ALL context (Age, BMI, Sleep, Steps).
      2. Return a VERY SHORT "Cause -> Effect" insight (max 12 words).
         - Format: "Because [Context], [Consuming X] causes [Y impact]."
         - VARIETY: Use diverse verbs (e.g., triggers, induces, accelerates, disrupts) and avoid repetitive "leads to" phrases.
         - Depth: Reference specific physiological effects (e.g., insulin spike, cortisol rise, metabolic dip).
      3. Suggest EXACTLY ONE immediate corrective action from these:
         - 10-minute brisk walk (if Steps < 4000)
         - Large glass of water (if Sleep < 6h)
         - Protein-rich snack swap (if Intensity > 3)
         - Choose specifically the most relevant one.

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

const getAppContent = async () => {
    try {
        const prompt = `
        You are a creative brand strategist for a health-tech app focused on tracking sugar intake and "beating the sugar spike".
        Generate an engaging brand identity and content for the app.
        
        Task:
        1. App Name: A catchy, modern name (e.g., "Glucose Guard", "Sugar Shift").
        2. Tagline: A short, punchy tagline (e.g., "Outsmart your cravings").
        3. Description: A one-sentence description of the app's purpose.
        4. Onboarding: A welcoming title and subtitle for the first screen.
        5. Log Items: Suggest 4 diverse "quick log" items with:
           - name: (e.g., "Morning Mocha", "Sweet Treat")
           - intensity: 1-5
           - icon: One of these Lucide icon names exactly: Coffee, Cookie, Droplet, Zap, Flame, Activity, GlassWater, Apple, Pizza
           - color: A Tailwind background color class (e.g., "bg-orange-500", "bg-pink-500")

        Format response as JSON:
        {
          "appName": "...",
          "tagline": "...",
          "description": "...",
          "onboarding": {
            "title": "...",
            "subtitle": "..."
          },
          "logItems": [
            { "id": "1", "name": "...", "intensity": 3, "icon": "...", "color": "..." },
            ...
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini App Content Error:", error);
        return {
            appName: "Beat the Sugar Spike",
            tagline: "Track. Understand. Change.",
            description: "Real-time feedback for your sugar habits.",
            onboarding: {
                title: "Beat the Sugar Spike",
                subtitle: "Track. Understand. Change."
            },
            logItems: [
                { id: 'chai', name: 'Chai / Coffee', icon: 'Coffee', intensity: 2, color: 'bg-orange-500' },
                { id: 'sweet', name: 'Sweet / Dessert', icon: 'Cookie', intensity: 5, color: 'bg-pink-500' },
                { id: 'cold_drink', name: 'Cold Drink', icon: 'Droplet', intensity: 4, color: 'bg-blue-500' },
                { id: 'snack', name: 'Packaged Snack', icon: 'Zap', intensity: 3, color: 'bg-yellow-500' },
            ]
        };
    }
};

module.exports = { getInsight, analyzeImage, analyzeAudio, analyzeText, getAppContent };
