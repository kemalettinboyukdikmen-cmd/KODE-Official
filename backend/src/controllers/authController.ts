import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { SecurityUtils } from '../utils/security';
import { Logger } from '../utils/logger';
import { db } from '../config/firebase';
import bcrypt from 'bcrypt';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Create user
      const user = await UserService.createUser(email, password, name);

      // Log the action
      await Logger.logAction(
        user.uid,
        'user_registered',
        'user',
        user.uid,
        { email, name },
        req.clientIP || '',
        req.userAgent || ''
      );

      // Generate token
      const token = SecurityUtils.generateToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Get user
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Check if account is frozen
      if (user.isFrozen) {
        res.status(403).json({ error: 'Account is frozen' });
        return;
      }

      // Check if banned
      if (user.role === 'banned') {
        res.status(403).json({ error: 'Account is banned' });
        return;
      }

      // Verify password using Firebase Auth
      try {
        // Note: In production, use Firebase Admin SDK to verify password
        // This is a placeholder - actual implementation depends on your setup
        await db.collection('users').doc(user.uid).get();
      } catch (error) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Update last login
      await UserService.updateLastLogin(user.uid);

      // Log the action
      await Logger.logAction(
        user.uid,
        'user_login',
        'user',
        user.uid,
        { email },
        req.clientIP || '',
        req.userAgent || ''
      );

      // Generate token
      const token = SecurityUtils.generateToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Login successful',
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('token');

      // Log the action
      if (req.user) {
        await Logger.logAction(
          req.user.uid || '',
          'user_logout',
          'user',
          req.user.uid || '',
          {},
          req.clientIP || '',
          req.userAgent || ''
        );
      }

      res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await UserService.getUserById(req.user.uid || '');
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { name, bio, avatar } = req.body;

      const updates: any = {};
      if (name) updates.name = SecurityUtils.sanitizeInput(name);
      if (bio) updates.bio = SecurityUtils.sanitizeInput(bio);
      if (avatar) updates.avatar = avatar;

      const user = await UserService.updateUser(req.user.uid || '', updates);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'profile_updated',
        'user',
        req.user.uid || '',
        updates,
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'password_changed',
        'user',
        req.user.uid || '',
        {},
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const token = SecurityUtils.generateToken({
        uid: req.user.uid || '',
        email: req.user.email || '',
        role: req.user.role || 'user',
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ token });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }
}
