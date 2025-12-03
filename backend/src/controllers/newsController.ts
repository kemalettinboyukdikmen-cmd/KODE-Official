import { Request, Response } from 'express';
import { ArticleService } from '../services/articleService';
import { CommentService } from '../services/commentService';
import { Logger } from '../utils/logger';

export class NewsController {
  /**
   * Create article
   */
  static async createArticle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { title, content, excerpt, tags, featuredImage, seoTitle, seoDescription } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      const article = await ArticleService.createArticle(
        title,
        content,
        excerpt || content.substring(0, 160),
        req.user.uid || '',
        req.user.name || '',
        req.user.avatar,
        tags || [],
        featuredImage,
        seoTitle,
        seoDescription
      );

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'article_created',
        'article',
        article.id,
        { title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(201).json({
        message: 'Article created successfully',
        article,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get article by slug
   */
  static async getArticle(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const article = await ArticleService.getArticleBySlug(slug);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Increment views
      await ArticleService.incrementViews(article.id);

      // Get comments
      const comments = await CommentService.getArticleComments(article.id);

      res.status(200).json({ article, comments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all articles
   */
  static async getArticles(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const tag = req.query.tag as string;

      let articles;
      if (tag) {
        articles = await ArticleService.getArticlesByTag(tag, limit);
      } else {
        articles = await ArticleService.getPublishedArticles(limit, offset);
      }

      res.status(200).json({ articles, count: articles.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update article
   */
  static async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { title, content, excerpt, tags, featuredImage, seoTitle, seoDescription } = req.body;

      const article = await ArticleService.getArticleById(id);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Check permissions
      if (article.author.uid !== req.user.uid && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const updates: any = {};
      if (title) updates.title = title;
      if (content) updates.content = content;
      if (excerpt) updates.excerpt = excerpt;
      if (tags) updates.tags = tags;
      if (featuredImage) updates.featured_image = featuredImage;
      if (seoTitle) updates.seoTitle = seoTitle;
      if (seoDescription) updates.seoDescription = seoDescription;

      const updatedArticle = await ArticleService.updateArticle(id, updates);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'article_updated',
        'article',
        id,
        { title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({
        message: 'Article updated successfully',
        article: updatedArticle,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Publish article
   */
  static async publishArticle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'editor' && req.user.role !== 'admin')) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const { id } = req.params;

      const article = await ArticleService.getArticleById(id);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      await ArticleService.publishArticle(id);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'article_published',
        'article',
        id,
        { title: article.title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Article published successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete article
   */
  static async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'editor' && req.user.role !== 'admin')) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const { id } = req.params;

      const article = await ArticleService.getArticleById(id);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      await ArticleService.deleteArticle(id);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'article_deleted',
        'article',
        id,
        { title: article.title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Search articles
   */
  static async searchArticles(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const articles = await ArticleService.searchArticles(q as string);

      res.status(200).json({ articles, count: articles.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
