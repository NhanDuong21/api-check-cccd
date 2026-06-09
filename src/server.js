require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cccdRoutes = require('./routes/cccd.route');

const app = express();
const PORT = process.env.PORT || 8088;

// Security and Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    service: "api-check-cccd",
    status: "running",
    description: "Vietnamese CCCD format validation API"
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "UP",
    service: "api-check-cccd",
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/cccd', cccdRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message || err);
  res.status(500).json({
    valid: false,
    message: "Internal Server Error"
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!process.env.API_KEY) {
    console.warn("WARNING: API_KEY is not defined in the environment. API key validation is disabled (local development mode).");
  }
});
