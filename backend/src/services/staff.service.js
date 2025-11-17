import prisma from '../db/prisma.js';

class StaffService {
  async getAllStaff() {
    return prisma.staff.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createStaff(data) {
    return prisma.staff.create({
      data: {
        name: data.name,
        role: data.role,
        isOnDuty: Boolean(data.isOnDuty)
      }
    });
  }

  async updateStaffDuty(id, isOnDuty) {
    return prisma.staff.update({
      where: { id: Number(id) },
      data: { isOnDuty: Boolean(isOnDuty) }
    });
  }
}

export default new StaffService();
