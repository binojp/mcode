const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dark1phantom23:ctZNTJON28hLyOZw@bugslayerzz.z6aicxj.mongodb.net/beatTheSugarSpike?retryWrites=true&w=majority', {
      dbName: 'beatTheSugarSpike',
      // In Mongoose 6+, these options are no longer necessary but good for clarity if using older versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
