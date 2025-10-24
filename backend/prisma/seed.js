import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  // Clean tables (idempotent-ish seed)
  await prisma.maintenance.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  // Users (password from env)
  const seedPassword = process.env.SEED_USER_PASSWORD || process.env.DEFAULT_USER_PASSWORD || 'password'
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(seedPassword, salt)
  const secretary = await prisma.user.create({
    data: {
      email: "secretary@example.com",
      name: "Society Secretary",
      role: "SECRETARY",
      passwordHash,
      block: 'A',
      flatNo: '101',
    },
  });
  const owner = await prisma.user.create({
    data: { email: "owner@example.com", name: "Flat Owner", role: "OWNER", passwordHash, block: 'B', flatNo: '202' },
  });
  const tenant = await prisma.user.create({
    data: { email: "tenant@example.com", name: "Flat Tenant", role: "TENANT", passwordHash, block: 'C', flatNo: '303' },
  });

  // Worker user linked to Staff
  const workerUser = await prisma.user.create({
    data: { email: "worker1@example.com", name: "Gate Security", role: "STAFF", passwordHash },
  })
  const workerStaff = await prisma.staff.create({
    data: { name: workerUser.name || workerUser.email, role: "Security", isOnDuty: true, userId: workerUser.id },
  })

  // Additional staff without linked user
  const cleaner = await prisma.staff.create({ data: { name: "Ravi", role: "Cleaning", isOnDuty: false } })
  const electrician = await prisma.staff.create({ data: { name: "Meera", role: "Electrician", isOnDuty: true } })

  // Notices
  await prisma.notice.createMany({
    data: [
      {
        title: "Water Supply Maintenance",
        content: "Water supply will be off from 2 PM to 4 PM on Friday.",
      },
      {
        title: "Diwali Celebration",
        content: "Join us in the clubhouse on Saturday at 7 PM.",
      },
    ],
  });

  // Issues
  await prisma.issue.create({ data: { description: "Elevator not working in Block A", status: "OPEN", userId: owner.id } })
  await prisma.issue.create({ data: { description: "Street light flickering near Gate", status: "IN_PROGRESS", assignedStaffId: workerStaff.id } })
  await prisma.issue.create({ data: { description: "Water leakage in Block C-202", status: "RESOLVED", assignedStaffId: electrician.id, userId: tenant.id } })
  await prisma.issue.createMany({
    data: [
      {
        description: "Elevator not working in Block A",
        status: "OPEN",
        userId: owner.id,
      },
      {
        description: "Street light flickering near Gate 2",
        status: "OPEN",
        userId: tenant.id,
      },
    ],
  });

  // Staff
  await prisma.staff.createMany({
    data: [
      { name: "Ramesh", role: "Cleaning", isOnDuty: true },
      { name: "Suresh", role: "Security", isOnDuty: false },
      { name: "Priya", role: "Maintenance", isOnDuty: true },
    ],
  });

  // Maintenance
  await prisma.maintenance.createMany({
    data: [
      { userId: owner.id, amount: 2500, status: "PAID" },
      { userId: tenant.id, amount: 2500, status: "DUE" },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
