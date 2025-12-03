import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/environment';
import { DeviceFingerprint, JWTPayload } from '../types';

export class SecurityUtils {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, clientData: any): string {
    const fingerprint = `${userAgent}-${clientData.platform}-${clientData.language}-${clientData.timezone}`;
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  }

  /**
   * Validate IP address against whitelist
   */
  static isIPWhitelisted(ip: string, whitelist: string[]): boolean {
    if (whitelist.length === 0) return false;
    return whitelist.includes(ip);
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return crypto.randomBytes(12).toString('hex');
  }
}
