import issueService from '../services/issue.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class IssueController {
  async getAllIssues(req, res) {
    try {
      const issues = await issueService.getAllIssues();
      res.json(issues);
    } catch (error) {
      console.error('Error in issues controller:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to fetch issues',
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error.stack 
        })
      });
    }
  }

  async createIssue(req, res) {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
      
      // Include the authenticated user's ID
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const issue = await issueService.createIssue(description, userId);
      res.status(201).json(issue);
    } catch (error) {
      console.error('Error creating issue:', error);
      res.status(500).json({ 
        error: 'Failed to create issue',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateIssueStatus(req, res) {
    try {
      const { status } = req.body;
      const issue = await issueService.updateIssueStatus(req.params.id, status);
      res.json(issue);
    } catch (error) {
      console.error('Error updating issue status:', error);
      res.status(400).json({ error: 'Failed to update issue status' });
    }
  }

  async takeIssue(req, res) {
    try {
      const user = req.user;
      const issueId = Number(req.params.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user is authorized (STAFF or SECRETARY)
      if (user.role !== 'STAFF' && user.role !== 'SECRETARY') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // If secretary is assigning to someone else
      let staffId = null;
      if (user.role === 'SECRETARY' && req.body?.staffId) {
        staffId = Number(req.body.staffId);
      } else {
        // Regular staff member taking the issue themselves
        const staff = await prisma.staff.findUnique({ 
          where: { userId: user.id } 
        });
        
        if (!staff) {
          return res.status(400).json({ 
            error: 'No staff record linked to this user' 
          });
        }
        staffId = staff.id;
      }

      const issue = await issueService.assignIssue(issueId, staffId);
      res.json(issue);
      
    } catch (error) {
      console.error('Error taking issue:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.status(500).json({ error: 'Failed to take issue' });
    }
  }

  async deleteIssue(req, res) {
    try {
      const issueId = Number(req.params.id);
      
      // Check if user is authorized (only the creator or admin can delete)
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { userId: true }
      });

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      // Allow deletion by admin, secretary, or the issue creator
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SECRETARY' && req.user.id !== issue.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this issue' });
      }

      await prisma.issue.delete({
        where: { id: issueId }
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting issue:', error);
      res.status(500).json({ error: 'Failed to delete issue' });
    }
  }

  async completeIssue(req, res) {
    try {
      const user = req.user;
      const { resolution } = req.body;
      const issueId = Number(req.params.id);
      
      if (!user || user.role !== 'STAFF') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const staff = await prisma.staff.findUnique({
        where: { userId: user.id }
      });

      if (!staff) {
        return res.status(400).json({ 
          error: 'No staff record linked to this user' 
        });
      }

      const issue = await issueService.completeIssue(issueId, staff.id, resolution);
      res.json(issue);
    } catch (error) {
      console.error('Error completing issue:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.status(500).json({ error: 'Failed to complete issue' });
    }
  }
}

export default new IssueController();
