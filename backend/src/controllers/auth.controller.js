import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth.js';
import userService from '../services/user.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Set secure HTTP-only cookie with cross-site support
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,  
        sameSite: 'none',  
        path: '/',       
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      console.log('Auth token cookie set with secure settings');

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const user = await userService.createUser({
        name,
        email,
        password,
        role: role || 'USER',
      });

      res.status(201).json({ user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        path: '/',
      });
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

export default new AuthController();
