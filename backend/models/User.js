const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true, // 'male', 'female', 'other'
    },
    height: {
      type: Number,
      required: true, // in cm
    },
    weight: {
      type: Number,
      required: true, // in kg
    },
    streak: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    level: {
        type: Number,
        default: 1
    },
    lastLogDate: {
      type: Date,
    },
    activityLevel: {
      type: String, // 'sedentary', 'light', 'moderate', 'active', 'very_active'
      default: 'moderate'
    },
    targetSugar: {
      type: Number, // calculated daily limit in grams
      default: 30
    },
    bmi: {
      type: Number,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple users with no email (null)
    },
    password: {
      type: String,
    },
    badges: [{
      name: String,
      icon: String,
      date: { type: Date, default: Date.now }
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
