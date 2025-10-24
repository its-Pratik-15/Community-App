import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  const staff = await prisma.staff.findMany()
  res.json(staff)
})

router.post('/', requireAuth, requireRole('SECRETARY'), async (req, res) => {
  const { name, role, isOnDuty } = req.body
  const s = await prisma.staff.create({ data: { name, role, isOnDuty: Boolean(isOnDuty) } })
  res.json(s)
})

router.patch('/:id', requireAuth, requireRole('SECRETARY'), async (req, res) => {
  const { isOnDuty } = req.body
  const s = await prisma.staff.update({ where: { id: Number(req.params.id) }, data: { isOnDuty: Boolean(isOnDuty) } })
  res.json(s)
})

export default router
