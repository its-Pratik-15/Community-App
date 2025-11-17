import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/auth/auth.routes.js";
import noticeRoutes from "./routes/notices/notice.routes.js";
import staffRoutes from "./routes/staff/staff.routes.js";
import maintenanceRoutes from "./routes/maintenance/maintenance.routes.js";
import issueRoutes from "./routes/issues/issue.routes.js";
import profileRoutes from "./routes/profile/profile.routes.js";

dotenv.config();
const app = express();


// Configure cookie parser first
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400
};

app.use(cors(corsOptions));

// Request logging for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`, {
      cookies: req.cookies,
      signedCookies: req.signedCookies,
      headers: req.headers
    });
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/me", requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    name: req.user.name
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      error: "Not allowed by CORS",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  // Handle Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Duplicate entry",
      details: "This record already exists",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
