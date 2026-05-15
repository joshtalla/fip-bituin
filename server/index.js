require('dotenv').config();

const express = require('express');
const cors = require('cors');

const promptRoutes = require('./routes/prompts');
const postRoutes = require('./routes/posts');
const reportRoutes = require('./routes/reports');
const searchRoutes = require('./routes/search');
const translateRoutes = require('./routes/translate');
const savedPostsRoutes = require('./routes/savedPosts');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', reportRoutes);
app.use('/api', translateRoutes);
app.use('/api', savedPostsRoutes);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/prompts', promptRoutes);

const replyRoutes = require('./routes/replies');
app.use('/api', replyRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
