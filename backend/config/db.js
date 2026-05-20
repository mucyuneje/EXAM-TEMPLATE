const mongoose = require('mongoose')
const cfg = require('./config')

async function connectDB() {
  try {
    await mongoose.connect(cfg.mongoUri)
    console.log('MongoDB connected:', cfg.mongoUri)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
