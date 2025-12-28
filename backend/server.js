
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Create tables
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'config/schema.sql'), 'utf8');
    await db.query(schemaSQL);
    console.log('Database schema created successfully');
    
    // Check if products already exist
    const existingProducts = await db.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(existingProducts.rows[0].count);
    
    if (productCount === 0) {
      // Insert sample data only if no products exist
      const seedSQL = fs.readFileSync(path.join(__dirname, 'config/seed-data.sql'), 'utf8');
      await db.query(seedSQL);
      console.log('Sample data inserted successfully');
    } else {
      console.log(`Database already has ${productCount} products, skipping seed data`);
    }
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Initialize database on startup
  await initializeDatabase();
});

module.exports = app;
