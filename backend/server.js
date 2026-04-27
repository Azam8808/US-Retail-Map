const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const storeRoutes = require('./routes/storeRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', storeRoutes);

app.get('/', (req, res) => {
  res.send('US Retail Locations Map API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
