const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

const userRoutes = require('./routes/userRoutes');
const logRoutes = require('./routes/logRoutes');
const appRoutes = require('./routes/appRoutes');

app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/app-content', appRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
