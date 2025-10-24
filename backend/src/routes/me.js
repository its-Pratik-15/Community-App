import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const idNum = Number(req.user.id)
    let user = null
    if (!Number.isNaN(idNum)) {
      user = await prisma.user.findUnique({ where: { id: idNum }, select: { id: true, email: true, name: true, role: true, photo: true } })
    }
    if (!user && req.user.email) {
      user = await prisma.user.findUnique({ where: { email: req.user.email }, select: { id: true, email: true, name: true, role: true, photo: true } })
    }
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

router.patch('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (name == null || String(name).trim() === '') {
      return res.status(400).json({ error: 'Name must not be empty' })
    }
    const idNum = Number(req.user.id)
    let target = null
    if (!Number.isNaN(idNum)) {
      target = { id: idNum }
    } else if (req.user.email) {
      // find by email to get numeric id
      const u = await prisma.user.findUnique({ where: { email: req.user.email } })
      if (u) target = { id: u.id }
    }
    if (!target) return res.status(400).json({ error: 'Invalid user identifier' })
    const user = await prisma.user.update({ where: target, data: { name }, select: { id: true, email: true, name: true, role: true, photo: true } })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
