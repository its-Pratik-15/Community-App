import { Router } from "express";
import { signToken } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const router = Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  try {
    const { email, name, password, role, block, flatNo, workerType } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });
    const emailOk = /.+@.+\..+/.test(String(email).toLowerCase());
    if (!emailOk)
      return res.status(422).json({ error: "Invalid email address" });
    if (String(password).length < 6)
      return res
        .status(422)
        .json({ error: "Password must be at least 6 characters" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // Determine final user role
    let finalRole = undefined
    if (role === 'WORKER') {
      finalRole = 'STAFF'
    } else if (["TENANT", "OWNER"].includes(role)) {
      finalRole = role
    }

    const user = await prisma.user.create({ data: { email, name: name || null, passwordHash, block: block || null, flatNo: flatNo || null, ...(finalRole ? { role: finalRole } : {}) } });

    // If registering a worker, also create a staff record with a category (workerType) and link to user
    if (role === 'WORKER') {
      const staffRole = workerType || 'WORKER'
      await prisma.staff.create({ data: { name: name || email, role: String(staffRole), isOnDuty: false, userId: user.id } })
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    if (e?.code === "P2002")
      return res.status(409).json({ error: "User already exists" });
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const emailOk = /.+@.+\..+/.test(String(email).toLowerCase())
    if (!emailOk) return res.status(422).json({ error: "Invalid email address" })

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.passwordHash) return res.status(401).json({ error: "This account does not have a password. Please register." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Incorrect password" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

export default router;
