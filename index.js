const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Scrap = require('./scrap');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 90,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many request from this IP, try again in 1 hour",
});

// CORS middleware
app.use(cors());

// Apply rate limiting to all requests
app.use(limiter);

// Middleware
app.use(express.json());

// Routes
app.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const scrapper = new Scrap(username);
    const data = await scrapper.fetchResponse();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // For testing purposes and Vercel serverless deployment
