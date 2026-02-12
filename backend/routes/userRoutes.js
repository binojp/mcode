const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Register or Get User by Device ID
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
  const { deviceId, age, gender, height, weight, activityLevel } = req.body;

  if (!deviceId) {
    return res.status(400).json({ message: 'Device ID is required' });
  }

  try {
    let user = await User.findOne({ deviceId });

    if (user) {
      return res.json(user);
    }

    let bmi;
    if (height && weight) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal
    }

    // Create new user
    user = await User.create({
      deviceId,
      age,
      gender,
      height,
      weight,
      activityLevel: activityLevel || 'moderate',
      bmi,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get User Data
// @route   GET /api/users/:deviceId
// @access  Public
router.get('/:deviceId', async (req, res) => {
  try {
    const user = await User.findOne({ deviceId: req.params.deviceId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
