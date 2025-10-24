import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import noticesRoutes from './routes/notices.js'
import issuesRoutes from './routes/issues.js'
import staffRoutes from './routes/staff.js'
import maintenanceRoutes from './routes/maintenance.js'
import meRoutes from './routes/me.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/me', meRoutes)
app.use('/api/notices', noticesRoutes)
app.use('/api/issues', issuesRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/maintenance', maintenanceRoutes)

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API on http://localhost:${port}`))
