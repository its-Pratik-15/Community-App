import prisma from '../db/prisma.js';

class MaintenanceService {
  async getAllMaintenance() {
    return prisma.maintenance.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createMaintenance(data) {
    return prisma.maintenance.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        status: data.status || 'PENDING'
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
}

export default new MaintenanceService();
