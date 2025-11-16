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

// CORS Configuration
console.log('CORS: Configuring CORS with credentials support');

const allowedOrigins = [
  'http://localhost:3000',
  'https://community-app-ochre.vercel.app',
  'https://community-app-kuzg.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check against allowed origins in production
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS not allowed for ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true, // This is important for cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
    'Content-Range',
    'X-Total-Count'
  ],
  exposedHeaders: [
    'set-cookie',
    'authorization',
    'content-range',
    'x-total-count',
    'access-control-allow-credentials'
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
