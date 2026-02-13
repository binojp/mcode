const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const User = require('../models/User');
const multer = require('multer');
const { getInsight, analyzeImage, analyzeAudio, analyzeText } = require('../utils/gemini');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file'); // Expect field name 'file'

// @desc    Log a sugar event (Text, Image, or Audio)
// @route   POST /api/logs
// @access  Public
router.post('/', upload, async (req, res) => {
  try {
    let { deviceId, type, intensity, steps, sleepHours, isCustomText } = req.body;
    
    // Ensure numeric types
    intensity = intensity ? Number(intensity) : undefined;
    steps = steps ? Number(steps) : 0;
    sleepHours = sleepHours ? Number(sleepHours) : 0;

    let imageAnalysis = null;
    let audioAnalysis = null;

    // Handle Custom Text Analysis
    if (isCustomText && type && !intensity) {
        const textAnalysis = await analyzeText(type);
        if (textAnalysis) {
            type = textAnalysis.item || type;
            intensity = textAnalysis.intensity || 3;
        }
    }

    // Handle File Upload (Image or Audio)
    if (req.file) {
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('image/')) {
        imageAnalysis = await analyzeImage(req.file.buffer, mimeType);
        if (imageAnalysis) {
          type = imageAnalysis.item || type;
          intensity = imageAnalysis.intensity || intensity;
        }
      } else if (mimeType.startsWith('audio/')) {
        audioAnalysis = await analyzeAudio(req.file.buffer, mimeType);
        if (audioAnalysis) {
          type = audioAnalysis.item || type;
          intensity = audioAnalysis.intensity || intensity;
        }
      }
    }

    if (!deviceId) {
      return res.status(400).json({ message: 'Missing required field: deviceId' });
    }
    if (!type && !req.file) {
      return res.status(400).json({ message: 'Missing required field: type or file' });
    }
    
    // Default values if not provided/derived
    if (!type) {
        const fallbacks = {
            image: ['AI Visual Scan', 'Photo Capture', 'Image Analysis'],
            audio: ['Voice Snippet', 'Audio Log', 'Voice Memo'],
            text: ['Quick Entry', 'Text Note', 'Manual Log']
        };
        
        if (req.file) {
            const list = req.file.mimetype.startsWith('image/') ? fallbacks.image : fallbacks.audio;
            type = list[Math.floor(Math.random() * list.length)];
        } else {
            type = fallbacks.text[Math.floor(Math.random() * fallbacks.text.length)];
        }
    }
    intensity = intensity || 3;
    
    console.log("Final log data:", { deviceId, type, intensity });

    const user = await User.findOne({ deviceId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create Log
    const log = await Log.create({
      userId: deviceId, 
      type,
      intensity,
      // image: req.file ? ... : null, // Add if storing
    });

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

    // --- Badge Awards ---
    const awardBadge = (name, icon) => {
        if (!user.badges.find(b => b.name === name)) {
            user.badges.push({ name, icon });
            return true;
        }
        return false;
    };

    let newBadge = null;
    if (user.streak === 1) {
        if (awardBadge('First Spike', '🔥')) newBadge = 'First Spike';
    } else if (user.streak === 3) {
        if (awardBadge('Sugar Scout', '🥈')) newBadge = 'Sugar Scout';
    } else if (user.streak === 7) {
        if (awardBadge('Spike Crusher', '🏅')) newBadge = 'Spike Crusher';
    }

    await user.save();

    // Generate Insight with User context (for BMI)
    const { insight, action } = await getInsight(type, intensity, steps || 5000, sleepHours || 7, user);

    res.status(201).json({
      log,
      streak: user.streak,
      points: user.points,
      pointsEarned,
      surpriseBonus, 
      newBadge, // Send to frontend
      insight,
      action
    });

    // Update log with the generated action and insight
    log.action = action;
    log.insight = insight;
    await log.save();

  } catch (error) {
    console.error("Log Error:", error);
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
