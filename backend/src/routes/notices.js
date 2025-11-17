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
  const item = await prisma.notice.create({ 
    data: { 
      title, 
      content,
      userId: req.user.id // Store the creator's ID
    } 
  })
  res.json(item)
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' })
    }

    // Only allow deletion by the creator or an admin (SECRETARY)
    if (notice.userId !== req.user.id && req.user.role !== 'SECRETARY') {
      return res.status(403).json({ error: 'Not authorized to delete this notice' })
    }

    await prisma.notice.delete({
      where: { id: notice.id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting notice:', error)
    res.status(500).json({ error: 'Failed to delete notice' })
  }
})

export default router
