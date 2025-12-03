import { db } from '../config/firebase';
import { AuditLog } from '../types';

export class Logger {
  static async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, unknown>,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      const log: AuditLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        timestamp: Date.now(),
      };

      await db.collection('auditLogs').doc(log.id).set(log);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  static async getUserLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const snapshot = await db
      .collection('auditLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as AuditLog);
  }

  static async getActionLogs(action: string, limit: number = 100): Promise<AuditLog[]> {
    const snapshot = await db
      .collection('auditLogs')
      .where('action', '==', action)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as AuditLog);
  }

  static async getRecentLogs(hours: number = 24, limit: number = 500): Promise<AuditLog[]> {
    const timestamp = Date.now() - hours * 60 * 60 * 1000;

    const snapshot = await db
      .collection('auditLogs')
      .where('timestamp', '>=', timestamp)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as AuditLog);
  }
}
