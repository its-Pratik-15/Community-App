import prisma from '../db/prisma.js';

class IssueService {
  async getAllIssues() {
    try {
      // Get issues with related user and staff data
      const issues = await prisma.issue.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {  
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        where: {}
      });
      
      // Map the response to ensure consistent property names
      return issues.map(issue => ({
        ...issue,
        // Use the correct property name 'assignedTo' from the schema
        assignedTo: issue.assignedTo || null,
        resolvedBy: issue.resolvedBy || null,
        user: issue.user || null
      }));
    } catch (error) {
      console.error('Error fetching issues:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta
      });
      
      // Check for database connection issues
      if (error.code === 'P1001') {
        throw new Error('Cannot connect to the database. Please check if the database server is running.');
      }
      
      // Check for relation errors
      if (error.code === 'P2016') {
        throw new Error('Data inconsistency detected. Some related records could not be found.');
      }
      
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  async createIssue(description, userId) {
    return prisma.issue.create({
      data: { 
        description, 
        status: 'OPEN',
        userId: Number(userId) 
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async updateIssueStatus(id, status) {
    return prisma.issue.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });
  }

  async assignIssue(issueId, staffId) {
    return prisma.issue.update({
      where: { id: Number(issueId) },
      data: { 
        assignedStaffId: staffId, 
        status: 'IN_PROGRESS' 
      },
      include: {
        assignedTo: { 
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async completeIssue(issueId, staffId, resolution) {
    return prisma.issue.update({
      where: { id: Number(issueId) },
      data: { 
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolution: resolution || 'Issue resolved',
        resolvedById: staffId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }
}

export default new IssueService();
