const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { initDb } = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files / documents
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));
``
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'BHOOMI CHITRA - National Land Acquisition & Management System',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Static serving of frontend production build (if built)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Global 404 handler for API
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.originalUrl}` });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Initialize database and start listening
async function startServer() {
  try {
    console.log('Initializing BHOOMI CHITRA database...');
    await initDb();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`BHOOMI CHITRA Backend Engine running on port ${PORT}`);
      console.log(`API Base: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
