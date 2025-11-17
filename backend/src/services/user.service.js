import prisma from '../db/prisma.js';
import bcrypt from 'bcryptjs';

class UserService {
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true
      }
    });
  }

  async createUser(userData) {
    const hashedPassword = userData.password
      ? await bcrypt.hash(userData.password, 10)
      : null;

    const isStaffUser = ['STAFF', 'SECRETARY'].includes(userData.role);
    
    // Create user and staff in a transaction to ensure data consistency
    return prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          passwordHash: hashedPassword,
          role: userData.role || 'USER',
          block: userData.block,
          flatNo: userData.flatNo
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      // If user is staff/secretary, create a staff record
      if (isStaffUser) {
        await prisma.staff.create({
          data: {
            name: user.name,
            role: user.role,
            isOnDuty: false,
            userId: user.id
          }
        });
      }

      return user;
    });
  }

  async getUserProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        createdAt: true
      }
    });
  }

  async updateUser(id, data) {
    const updateData = { ...data };
    
    // Only hash password if it's being updated
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    return prisma.$transaction(async (prisma) => {
      // Get the current user to check role changes
      const currentUser = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { staff: true }
      });

      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: updateData,
        include: { staff: true }
      });

      const isStaffUser = ['STAFF', 'SECRETARY'].includes(updatedUser.role);
      const wasStaffUser = ['STAFF', 'SECRETARY'].includes(currentUser.role);

      // Handle staff record based on role changes
      if (isStaffUser && !wasStaffUser) {
        // User is now a staff/secretary, create staff record
        await prisma.staff.create({
          data: {
            name: updatedUser.name,
            role: updatedUser.role,
            isOnDuty: false,
            userId: updatedUser.id
          }
        });
      } else if (!isStaffUser && wasStaffUser && currentUser.staff) {
        // User is no longer staff/secretary, delete staff record if exists
        await prisma.staff.delete({
          where: { id: currentUser.staff.id }
        });
      } else if (isStaffUser && wasStaffUser && currentUser.staff) {
        // Update staff role if it changed
        if (currentUser.role !== updatedUser.role) {
          await prisma.staff.update({
            where: { id: currentUser.staff.id },
            data: { role: updatedUser.role }
          });
        }
      }

      // Return the updated user with staff information
      return prisma.user.findUnique({
        where: { id: Number(id) },
        include: { staff: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          photo: true,
          staff: true
        }
      });
    });
  }

  async findUserByIdOrEmail(identifier) {
    const idNum = Number(identifier);
    if (!isNaN(idNum)) {
      return prisma.user.findUnique({ where: { id: idNum } });
    }
    if (typeof identifier === 'string' && identifier.includes('@')) {
      return prisma.user.findUnique({ where: { email: identifier } });
    }
    return null;
  }
}

export default new UserService();
