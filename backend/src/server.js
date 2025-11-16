import express, { Router } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth/auth.routes.js';
import noticeRoutes from './routes/notices/notice.routes.js';
import staffRoutes from './routes/staff/staff.routes.js';
import maintenanceRoutes from './routes/maintenance/maintenance.routes.js';
import issueRoutes from './routes/issues/issue.routes.js';
import profileRoutes from './routes/profile/profile.routes.js';

dotenv.config();
const app = express();

// CORS Configuration - Allow all origins
console.log('CORS: Allowing all origins');

const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: [
    'Set-Cookie',
    'Content-Range',
    'X-Total-Count'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/profile', profileRoutes);

// Backward compatibility redirects
app.get('/api/me', requireAuth, (req, res) => {
  res.redirect('/api/profile/me');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
