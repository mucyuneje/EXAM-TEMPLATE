import mongoose from 'mongoose'
import cfg from './config.js'

export default async function connectDB() {
  try {
    await mongoose.connect(cfg.mongoUri)
    console.log('MongoDB connected:', cfg.mongoUri)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}
