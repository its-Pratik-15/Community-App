import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  const items = await prisma.maintenance.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.post('/', requireAuth, requireRole('SECRETARY'), async (req, res) => {
  const { userId, amount, status } = req.body
  const item = await prisma.maintenance.create({ data: { userId, amount, status } })
  res.json(item)
})

export default router
