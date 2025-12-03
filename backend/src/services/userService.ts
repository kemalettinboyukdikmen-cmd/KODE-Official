import { db, auth } from '../config/firebase';
import { User } from '../types';
import { SecurityUtils } from '../utils/security';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'editor' | 'user' = 'user'
  ): Promise<User> {
    try {
      // Create user in Firebase Auth
      const authUser = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Create user document in Firestore
      const user: User = {
        uid: authUser.uid,
        email,
        name,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}`,
        bio: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFrozen: false,
      };

      await db.collection('users').doc(authUser.uid).set(user);

      return user;
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(uid: string): Promise<User | null> {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = await db.collection('users').where('email', '==', email).limit(1).get();
    return query.empty ? null : (query.docs[0].data() as User);
  }

  /**
   * Update user
   */
  static async updateUser(uid: string, updates: Partial<User>): Promise<User> {
    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await db.collection('users').doc(uid).update(updatedData);

    const user = await this.getUserById(uid);
    if (!user) throw new Error('User not found');

    return user;
  }

  /**
   * Freeze user account
   */
  static async freezeUser(uid: string, reason: string): Promise<void> {
    await db.collection('users').doc(uid).update({
      isFrozen: true,
      updatedAt: Date.now(),
    });

    // Log the action
    await db.collection('auditLogs').add({
      userId: uid,
      action: 'account_frozen',
      resource: 'user',
      resourceId: uid,
      details: { reason },
      timestamp: Date.now(),
    });
  }

  /**
   * Unfreeze user account
   */
  static async unfreezeUser(uid: string): Promise<void> {
    await db.collection('users').doc(uid).update({
      isFrozen: false,
      updatedAt: Date.now(),
    });
  }

  /**
   * Change user role
   */
  static async changeUserRole(
    uid: string,
    newRole: 'admin' | 'editor' | 'user' | 'banned'
  ): Promise<void> {
    await db.collection('users').doc(uid).update({
      role: newRole,
      updatedAt: Date.now(),
    });
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    const results = await db
      .collection('users')
      .where('email', '>=', query)
      .where('email', '<=', query + '\uf8ff')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as User);
  }

  /**
   * Get all users
   */
  static async getAllUsers(limit: number = 100, offset: number = 0): Promise<User[]> {
    const results = await db
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    return results.docs.map((doc) => doc.data() as User);
  }

  /**
   * Delete user
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(uid);

      // Delete user document
      await db.collection('users').doc(uid).delete();

      // Delete user's posts, comments, etc.
      const postsQuery = await db.collection('projects').where('author.uid', '==', uid).get();
      for (const doc of postsQuery.docs) {
        await doc.ref.delete();
      }

      const commentsQuery = await db.collection('comments').where('author.uid', '==', uid).get();
      for (const doc of commentsQuery.docs) {
        await doc.ref.delete();
      }
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(uid: string): Promise<void> {
    await db.collection('users').doc(uid).update({
      lastLogin: Date.now(),
    });
  }
}
