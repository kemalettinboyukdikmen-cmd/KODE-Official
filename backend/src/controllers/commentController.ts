import { Request, Response } from 'express';
import { CommentService } from '../services/commentService';
import { Logger } from '../utils/logger';

export class CommentController {
  /**
   * Create comment
   */
  static async createComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { content, isAnonymous, anonName, articleId, projectId } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      if (!articleId && !projectId) {
        res.status(400).json({ error: 'Either articleId or projectId is required' });
        return;
      }

      const comment = await CommentService.createComment(
        content,
        req.user.uid || '',
        req.user.name || '',
        req.user.avatar,
        isAnonymous || false,
        anonName,
        articleId,
        projectId
      );

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'comment_created',
        'comment',
        comment.id,
        { articleId, projectId },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(201).json({
        message: 'Comment created successfully',
        comment,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get comments for article
   */
  static async getArticleComments(req: Request, res: Response): Promise<void> {
    try {
      const { articleId } = req.params;

      const comments = await CommentService.getArticleComments(articleId);

      res.status(200).json({ comments, count: comments.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get comments for project
   */
  static async getProjectComments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const comments = await CommentService.getProjectComments(projectId);

      res.status(200).json({ comments, count: comments.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update comment
   */
  static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { content } = req.body;

      const comment = await CommentService.getCommentById(id);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      // Check permissions
      if (comment.author.uid !== req.user.uid && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const updatedComment = await CommentService.updateComment(id, { content });

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'comment_updated',
        'comment',
        id,
        {},
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({
        message: 'Comment updated successfully',
        comment: updatedComment,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      const comment = await CommentService.getCommentById(id);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      // Check permissions
      if (comment.author.uid !== req.user.uid && req.user.role !== 'admin' && req.user.role !== 'editor') {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      await CommentService.deleteComment(id);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'comment_deleted',
        'comment',
        id,
        {},
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Report comment
   */
  static async reportComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      const comment = await CommentService.getCommentById(id);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      await CommentService.reportComment(id);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'comment_reported',
        'comment',
        id,
        {},
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Comment reported successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Like comment
   */
  static async likeComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      await CommentService.likeComment(id, req.user.uid || '');

      res.status(200).json({ message: 'Like toggled successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Dislike comment
   */
  static async dislikeComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      await CommentService.dislikeComment(id, req.user.uid || '');

      res.status(200).json({ message: 'Dislike toggled successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get reported comments
   */
  static async getReportedComments(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor')) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const comments = await CommentService.getReportedComments();

      res.status(200).json({ comments, count: comments.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
