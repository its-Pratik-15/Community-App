import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  const items = await prisma.issue.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.post('/', async (req, res) => {
  const { description } = req.body
  const item = await prisma.issue.create({ data: { description, status: 'OPEN' } })
  res.json(item)
})

router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body
  const item = await prisma.issue.update({ where: { id: Number(req.params.id) }, data: { status } })
  res.json(item)
})

// Worker takes an issue: assign to their staff record and set status to IN_PROGRESS
router.post('/:id/take', requireAuth, async (req, res) => {
  try {
    const user = req.user // { id, role }
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    if (user.role !== 'STAFF' && user.role !== 'SECRETARY') return res.status(403).json({ error: 'Forbidden' })

    const issueId = Number(req.params.id)
    const issue = await prisma.issue.findUnique({ where: { id: issueId } })
    if (!issue) return res.status(404).json({ error: 'Issue not found' })
    if (issue.status !== 'OPEN' && issue.assignedStaffId) return res.status(409).json({ error: 'Issue already taken' })

    // secretary can assign to any staff via body.staffId, otherwise use current worker's staff record
    let staffId = null
    if (user.role === 'SECRETARY' && req.body?.staffId) {
      staffId = Number(req.body.staffId)
    } else {
      const staff = await prisma.staff.findUnique({ where: { userId: user.id } })
      if (!staff) return res.status(400).json({ error: 'No staff record linked to this user' })
      staffId = staff.id
    }

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: { assignedStaffId: staffId, status: 'IN_PROGRESS' },
    })
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: 'Failed to take issue' })
  }
})

// Worker resolves an issue: only the assigned worker or secretary can resolve, sets status to RESOLVED
router.post('/:id/resolve', requireAuth, async (req, res) => {
  try {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const issueId = Number(req.params.id)
    const issue = await prisma.issue.findUnique({ where: { id: issueId } })
    if (!issue) return res.status(404).json({ error: 'Issue not found' })

    let allowed = false
    if (user.role === 'SECRETARY') {
      allowed = true
    } else if (user.role === 'STAFF') {
      const staff = await prisma.staff.findUnique({ where: { userId: user.id } })
      if (staff && issue.assignedStaffId === staff.id) allowed = true
    }
    if (!allowed) return res.status(403).json({ error: 'Forbidden' })

    const updated = await prisma.issue.update({ where: { id: issueId }, data: { status: 'RESOLVED' } })
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: 'Failed to resolve issue' })
  }
})

// Secretary can delete an issue
router.delete('/:id', requireAuth, requireRole('SECRETARY'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.issue.delete({ where: { id } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete issue' })
  }
})

export default router
