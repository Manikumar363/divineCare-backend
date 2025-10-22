

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/home', require('./src/routes/Home/home'));
app.use('/api/about', require('./src/routes/Home/about'));
app.use('/api/gallery', require('./src/routes/Home/gallery'));
app.use('/api/testimonials', require('./src/routes/Home/testimonials'));
app.use('/api/team-members', require('./src/routes/Home/teamSection'));
app.use('/api/home/event', require('./src/routes/Home/homeEvent'));
app.use('/api/about/main', require('./src/routes/About/mainAbout'));
app.use('/api/about/mission', require('./src/routes/About/missionAbout'));
app.use('/api/about/vision', require('./src/routes/About/visionAbout'));
app.use('/api/about/company', require('./src/routes/About/companyAbout'));
app.use('/api/about/testimonials', require('./src/routes/About/aboutTestimonials'));
app.use('/api/services', require('./src/routes/services'));


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'DivineCare Backend is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DivineCare Backend server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});