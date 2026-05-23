import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import cfg from './config/config.js'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import packageRoutes from './routes/packageRoutes.js'
import carRoutes from './routes/carRoutes.js'
import servicePackageRoutes from './routes/servicePackageRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
  res.json({ message: 'CWSMS API running', endpoints: ['/api/auth', '/api/packages', '/api/cars', '/api/service-packages', '/api/payments', '/api/reports'] })
})

app.use('/api/auth', authRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/service-packages', servicePackageRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/stats', statsRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

connectDB().then(() => {
  app.listen(cfg.port, () => {
    console.log(`CRPMS server running on port ${cfg.port}`)
  })
})
