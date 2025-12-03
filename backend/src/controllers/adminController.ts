import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { Logger } from '../utils/logger';

export class AdminController {
  /**
   * Get all users
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await UserService.getAllUsers(limit, offset);

      res.status(200).json({ users, count: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Search users
   */
  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const users = await UserService.searchUsers(q as string);

      res.status(200).json({ users, count: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Change user role
   */
  static async changeUserRole(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['admin', 'editor', 'user', 'banned'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      await UserService.changeUserRole(userId, role);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'user_role_changed',
        'user',
        userId,
        { newRole: role },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'User role changed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Freeze user account
   */
  static async freezeUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;
      const { reason } = req.body;

      await UserService.freezeUser(userId, reason || 'Admin action');

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'user_frozen',
        'user',
        userId,
        { reason },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'User frozen successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Unfreeze user account
   */
  static async unfreezeUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;

      await UserService.unfreezeUser(userId);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'user_unfrozen',
        'user',
        userId,
        {},
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'User unfrozen successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user logs
   */
  static async getUserLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;

      const logs = await Logger.getUserLogs(userId, 100);

      res.status(200).json({ logs, count: logs.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get action logs
   */
  static async getActionLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { action } = req.query;

      if (!action) {
        res.status(400).json({ error: 'Action parameter required' });
        return;
      }

      const logs = await Logger.getActionLogs(action as string, 100);

      res.status(200).json({ logs, count: logs.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get recent logs
   */
  static async getRecentLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const hours = parseInt(req.query.hours as string) || 24;

      const logs = await Logger.getRecentLogs(hours, 500);

      res.status(200).json({ logs, count: logs.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;

      await UserService.deleteUser(userId);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'user_deleted',
        'user',
        userId,
        {},
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create user (admin only)
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
      }

      const user = await UserService.createUser(email, password, name, role || 'user');

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'user_created_by_admin',
        'user',
        user.uid,
        { email, role },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(201).json({
        message: 'User created successfully',
        user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
