const mongoose = require('mongoose');

const logSchema = mongoose.Schema(
  {
    userId: {
      type: String, // Refers to deviceId
      required: true,
      ref: 'User'
    },
    type: {
      type: String,
      required: true, // 'Chai', 'Sweet', 'Cold Drink', 'Package Snack'
    },
    intensity: {
      type: Number,
      required: true, // 1-5 scale based on item
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    action: {
      type: String, // The suggested action text
    },
    insight: {
      type: String, // The scientific insight text
    },
    actionCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Log', logSchema);
