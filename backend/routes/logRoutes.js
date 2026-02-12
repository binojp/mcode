const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const User = require('../models/User');
const { getInsight } = require('../utils/insights');

// @desc    Log a sugar event
// @route   POST /api/logs
// @access  Public
router.post('/', async (req, res) => {
  const { deviceId, type, intensity, steps, sleepHours } = req.body;

  if (!deviceId || !type || !intensity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ deviceId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create Log
    const log = await Log.create({
      userId: user._id, // Storing User ObjectId, but referencing logic usually uses deviceId in this simple app. 
                        // Actually, schema said userId references User. Let's consistency check.
                        // Schema: userId: { type: String, ref: 'User' } ... wait.
                        // Ideally ref should be ObjectId if using populate.
                        // For simplicity in this hackathon code, I'll store the User's _id if I want to relate specific user doc,
                        // OR store deviceId string if I just want to query by string.
                        // The User model has `deviceId` as a string.
                        // Let's store the User's ObjectId to be proper Mongoose, but look it up via deviceId.
      userId: deviceId, // Schema expects String? Let's check Schema.
                         // My Log schema defined userId as String. Let's use deviceId for simplicity.
      type,
      intensity,
    });

    // Update User Stats (Streak, Points)
    // Simple streak logic: If last log was yesterday, increment. If today, ignore. If older, reset (unless we want lenient streaks).
    // Prompt says: "One daily sugar log... Streak counter...". Logging sugar keeps the streak?
    // "Log today to protect your streak" implies logging *anything* keeps the streak?
    // Or is it logging a "good" day?
    // "Capture a sugar event... Log today to protect your streak".
    // It seems logging the *event* is the habit. Being honest.
    
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLog = user.lastLogDate ? new Date(user.lastLogDate).setHours(0, 0, 0, 0) : null;

    // --- Enhanced Scoring & Variable Rewards ---

    // 1. Base Points
    let pointsEarned = 10; 

    // 2. Streak Bonus
    if (lastLog) {
        const diffDays = (today - lastLog) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) { // Consecutive day
            user.streak += 1;
            pointsEarned += 5; 
        } else if (diffDays > 1) {
            user.streak = 1; // Reset
        }
    } else {
        user.streak = 1; // First log
    }

    // 3. Time Bonus (Before 6 PM)
    const hour = new Date().getHours();
    if (hour < 18) {
        pointsEarned += 3; 
    }

    // 4. Activity Bonus (Mocked steps > 5000)
    // In a real app, this comes from the passive data sync.
    if (steps > 5000) {
        pointsEarned += 5;
    }

    // 5. Variable Reward (Random "Surprise" Bonus)
    // 30% chance to get a "Sugar Crusher" bonus
    let surpriseBonus = 0;
    const isLucky = Math.random() < 0.3; 
    if (isLucky) {
        surpriseBonus = Math.floor(Math.random() * 10) + 5; // 5 to 15 points
        pointsEarned += surpriseBonus;
    }

    user.points += pointsEarned;
    user.lastLogDate = new Date();
    await user.save();

    // Generate Insight with User context (for BMI)
    const { insight, action } = getInsight(type, intensity, steps || 5000, sleepHours || 7, user);

    res.status(201).json({
      log,
      streak: user.streak,
      points: user.points,
      pointsEarned,
      surpriseBonus, // Send this to frontend to show special animation
      insight,
      action
    });

    // Update log with the generated action
    log.action = action;
    await log.save();

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get Logs for a user
// @route   GET /api/logs/:deviceId
// @access  Public
router.get('/:deviceId', async (req, res) => {
    try {
        const logs = await Log.find({ userId: req.params.deviceId }).sort({ createdAt: -1 }).limit(20);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Mark action as completed
// @route   POST /api/logs/:id/complete
// @access  Public
router.post('/:id/complete', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }

        if (log.actionCompleted) {
            return res.status(400).json({ message: 'Action already completed' });
        }

        // Check if within 30 minutes
        const diff = (new Date() - new Date(log.createdAt)) / (1000 * 60);
        if (diff > 30) {
             return res.status(400).json({ message: 'Action expired (must complete within 30 mins)' });
        }

        log.actionCompleted = true;
        await log.save();

        const user = await User.findOne({ deviceId: log.userId });
        if (user) {
            user.points += 7;
            await user.save();
        }

        res.json({ message: 'Action completed', points: user ? user.points : 0 });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

    module.exports = router;
