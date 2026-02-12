const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    // In Mongoose 6+, these options are no longer necessary but good for clarity if using older versions
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
