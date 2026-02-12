const getInsight = (sugarType, intensity, steps, sleepHours, user) => {
    const hour = new Date().getHours();
    const isEvening = hour >= 18;
    const isMorning = hour >= 5 && hour < 12;

    // Silent BMI Calculation
    let bmi = 0;
    if (user && user.height && user.weight) {
        // height in cm, weight in kg
        const heightMetres = user.height / 100;
        bmi = user.weight / (heightMetres * heightMetres);
    }

    // Default insight
    let insight = "Sugary treats gives a quick spike, but a crash follows soon.";
    let action = "Drink a glass of water to help process the sugar.";

    // Context: High BMI + Sugar
    if (bmi > 25 && intensity > 3) {
        insight = "Frequent sugar spikes can make it harder to manage weight over time.";
        action = "Try a 10-minute walk to use up this glucose immediately.";
    }
    // Context: High Steps (Active Day)
    else if (steps > 8000) {
        insight = "You've been active today, so your body can handle this better.";
        action = "Keep moving to burn off the extra energy.";
    } 
    // Context: Low Steps + Evening (Sleep Risk)
    else if (steps < 3000 && isEvening) {
        insight = "Low activity today and sugar at night can disrupt your deep sleep.";
        action = "Try a 10-minute walk before bed to stabilize blood sugar.";
    }
    // Context: Morning Sugar
    else if (isMorning && intensity > 3) {
        insight = "Starting the day with high sugar can lead to an energy crash by noon.";
        action = "Pair this with some protein (like nuts) to slow absorption.";
    }
    // Context: Poor Sleep History
    else if (sleepHours < 6) {
        insight = "You're tired, so your brain is craving quick energy. It's a trap.";
        action = "A short nap or fresh air is better than sugar right now.";
    }
    
    return { insight, action };
};

module.exports = { getInsight };
