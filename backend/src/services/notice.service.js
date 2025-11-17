import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    return prisma.notice.delete({
      where: { id: Number(id) }
    });
  }
}

export default new NoticeService();
