import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  const items = await prisma.notice.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.post('/', requireAuth, requireRole('SECRETARY'), async (req, res) => {
  const { title, content } = req.body
  const item = await prisma.notice.create({ data: { title, content } })
  res.json(item)
})

export default router
