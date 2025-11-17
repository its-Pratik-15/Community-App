import prisma from '../db/prisma.js';

class NoticeService {
  async getAllNotices() {
    return prisma.notice.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: {
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

  async createNotice(data) {
    return prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        userId: data.userId
      },
      include: {
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

  async deleteNotice(id, userId, userRole) {
    try {
      const notice = await prisma.notice.findUnique({
        where: { id: Number(id) }
      });

      if (!notice) {
        throw new Error('Notice not found');
      }

      // Only secretary/admin or the creator can delete
      if (notice.userId !== userId && userRole !== 'SECRETARY') {
        throw new Error('Not authorized to delete this notice');
      }

      return await prisma.notice.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      console.error('Error in deleteNotice:', error);
      throw error;
    }
  }
}

export default new NoticeService();
