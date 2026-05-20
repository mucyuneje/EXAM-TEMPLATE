const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const cfg = require('./config/config')

const app = express()

// ── Middleware ──────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'))
app.use('/api/rooms',       require('./routes/rooms'))
app.use('/api/guests',      require('./routes/guests'))
app.use('/api/bookings',    require('./routes/bookings'))
app.use('/api/payments',    require('./routes/payments'))
app.use('/api/reports',     require('./routes/reports'))
app.use('/api/stats',       require('./routes/stats'))

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'HMS API', version: '1.0.0' })
})

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

// ── Start ──────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(cfg.port, () => {
    console.log(`HMS API running on http://localhost:${cfg.port}`)
  })
})
