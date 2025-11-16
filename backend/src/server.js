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
console.log('CORS: Configuring with credentials support');

const allowedOrigins = [
  'http://localhost:5173',
  'https://community-a8kebl7sn-pratik-15s-projects.vercel.app',
  'https://community-app-gamma.vercel.app',
  'https://community-app-kuzg.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For Vercel preview deployments, allow any subdomain of vercel.app
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    console.log('CORS: Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Total-Count',
    'Access-Control-Allow-Credentials',
    'Set-Cookie'
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
