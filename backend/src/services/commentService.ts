import { db } from '../config/firebase';
import { Comment } from '../types';
import { SecurityUtils } from '../utils/security';

export class CommentService {
  /**
   * Create a new comment
   */
  static async createComment(
    content: string,
    authorId: string,
    authorName: string,
    authorAvatar: string | undefined,
    isAnonymous: boolean = false,
    anonName?: string,
    articleId?: string,
    projectId?: string
  ): Promise<Comment> {
    const id = SecurityUtils.generateId();

    const comment: Comment = {
      id,
      content: SecurityUtils.sanitizeInput(content),
      author: {
        uid: authorId,
        name: isAnonymous ? (anonName || 'Anonymous') : authorName,
        isAnonymous,
        anonName: isAnonymous ? anonName : undefined,
        avatar: isAnonymous ? undefined : authorAvatar,
      },
      articleId,
      projectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: 0,
      dislikes: 0,
      isReported: false,
    };

    await db.collection('comments').doc(id).set(comment);
    return comment;
  }

  /**
   * Get comment by ID
   */
  static async getCommentById(id: string): Promise<Comment | null> {
    const doc = await db.collection('comments').doc(id).get();
    return doc.exists ? (doc.data() as Comment) : null;
  }

  /**
   * Get comments for an article
   */
  static async getArticleComments(articleId: string, limit: number = 50): Promise<Comment[]> {
    const results = await db
      .collection('comments')
      .where('articleId', '==', articleId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Comment);
  }

  /**
   * Get comments for a project
   */
  static async getProjectComments(projectId: string, limit: number = 50): Promise<Comment[]> {
    const results = await db
      .collection('comments')
      .where('projectId', '==', projectId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Comment);
  }

  /**
   * Update comment
   */
  static async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await db.collection('comments').doc(id).update(updatedData);

    const comment = await this.getCommentById(id);
    if (!comment) throw new Error('Comment not found');

    return comment;
  }

  /**
   * Delete comment
   */
  static async deleteComment(id: string): Promise<void> {
    await db.collection('comments').doc(id).delete();
  }

  /**
   * Report comment
   */
  static async reportComment(id: string): Promise<void> {
    const comment = await this.getCommentById(id);
    if (!comment) throw new Error('Comment not found');

    await db.collection('comments').doc(id).update({
      isReported: true,
    });

    // Log the report
    await db.collection('reports').add({
      commentId: id,
      articleId: comment.articleId,
      projectId: comment.projectId,
      reason: 'User reported',
      createdAt: Date.now(),
    });
  }

  /**
   * Get reported comments
   */
  static async getReportedComments(limit: number = 100): Promise<Comment[]> {
    const results = await db
      .collection('comments')
      .where('isReported', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Comment);
  }

  /**
   * Like comment
   */
  static async likeComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.getCommentById(commentId);
    if (!comment) throw new Error('Comment not found');

    const likeRef = db.collection('commentLikes').doc(`${commentId}-${userId}`);
    const dislikeRef = db.collection('commentDislikes').doc(`${commentId}-${userId}`);

    const hasLike = await likeRef.get();
    const hasDislike = await dislikeRef.get();

    if (hasLike.exists) {
      // Unlike
      await likeRef.delete();
      await db.collection('comments').doc(commentId).update({
        likes: Math.max(0, comment.likes - 1),
      });
    } else {
      // Remove dislike if exists
      if (hasDislike.exists) {
        await dislikeRef.delete();
        await db.collection('comments').doc(commentId).update({
          dislikes: Math.max(0, comment.dislikes - 1),
        });
      }

      // Add like
      await likeRef.set({ commentId, userId, createdAt: Date.now() });
      await db.collection('comments').doc(commentId).update({
        likes: comment.likes + 1,
      });
    }
  }

  /**
   * Dislike comment
   */
  static async dislikeComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.getCommentById(commentId);
    if (!comment) throw new Error('Comment not found');

    const likeRef = db.collection('commentLikes').doc(`${commentId}-${userId}`);
    const dislikeRef = db.collection('commentDislikes').doc(`${commentId}-${userId}`);

    const hasLike = await likeRef.get();
    const hasDislike = await dislikeRef.get();

    if (hasDislike.exists) {
      // Undislike
      await dislikeRef.delete();
      await db.collection('comments').doc(commentId).update({
        dislikes: Math.max(0, comment.dislikes - 1),
      });
    } else {
      // Remove like if exists
      if (hasLike.exists) {
        await likeRef.delete();
        await db.collection('comments').doc(commentId).update({
          likes: Math.max(0, comment.likes - 1),
        });
      }

      // Add dislike
      await dislikeRef.set({ commentId, userId, createdAt: Date.now() });
      await db.collection('comments').doc(commentId).update({
        dislikes: comment.dislikes + 1,
      });
    }
  }

  /**
   * Get user's comments
   */
  static async getUserComments(userId: string, limit: number = 50): Promise<Comment[]> {
    const results = await db
      .collection('comments')
      .where('author.uid', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Comment);
  }
}
