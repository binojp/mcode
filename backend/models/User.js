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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
