// 1. Open the vault immediately so the whole app has access to your keys
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// 2. Import the "Host" (your prompts router map)
const promptRoutes = require('./routes/prompts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// 3. Updated CORS as requested in your ticket so React (port 5173) isn't blocked
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 4. Plug in your prompts router
// This tells the server: "Any request starting with /api/prompts should be handled by promptRoutes"
app.use('/api/prompts', promptRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});