import { Request, Response } from 'express';
import { ForumService } from '../services/forumService';
import { CommentService } from '../services/commentService';
import { Logger } from '../utils/logger';

export class ForumController {
  /**
   * Create project
   */
  static async createProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { title, description, tags, images, links } = req.body;

      if (!title || !description) {
        res.status(400).json({ error: 'Title and description are required' });
        return;
      }

      const project = await ForumService.createProject(
        title,
        description,
        req.user.uid || '',
        req.user.name || '',
        req.user.avatar,
        tags || [],
        images || [],
        links || []
      );

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'project_created',
        'project',
        project.id,
        { title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(201).json({
        message: 'Project created successfully',
        project,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get project
   */
  static async getProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const project = await ForumService.getProjectById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      // Increment views
      await ForumService.incrementViews(id);

      // Get comments
      const comments = await CommentService.getProjectComments(id);

      res.status(200).json({ project, comments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all projects
   */
  static async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const sortBy = (req.query.sortBy as 'recent' | 'popular' | 'trending') || 'recent';
      const tag = req.query.tag as string;

      let projects;
      if (tag) {
        projects = await ForumService.getProjectsByTag(tag, limit);
      } else {
        projects = await ForumService.getAllProjects(limit, offset, sortBy);
      }

      res.status(200).json({ projects, count: projects.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update project
   */
  static async updateProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { title, description, tags, images, links } = req.body;

      const project = await ForumService.getProjectById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      // Check permissions
      if (project.author.uid !== req.user.uid && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const updates: any = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (tags) updates.tags = tags;
      if (images) updates.images = images;
      if (links) updates.links = links;

      const updatedProject = await ForumService.updateProject(id, updates);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'project_updated',
        'project',
        id,
        { title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({
        message: 'Project updated successfully',
        project: updatedProject,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Like project
   */
  static async likeProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      await ForumService.toggleLike(id, req.user.uid || '');

      res.status(200).json({ message: 'Like toggled successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Dislike project
   */
  static async dislikeProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      await ForumService.toggleDislike(id, req.user.uid || '');

      res.status(200).json({ message: 'Dislike toggled successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get popular projects
   */
  static async getPopularProjects(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const projects = await ForumService.getPopularProjects(limit);

      res.status(200).json({ projects, count: projects.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete project
   */
  static async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'admin')) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const { id } = req.params;

      const project = await ForumService.getProjectById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      await ForumService.deleteProject(id);

      // Log the action
      await Logger.logAction(
        req.user.uid || '',
        'project_deleted',
        'project',
        id,
        { title: project.title },
        req.clientIP || '',
        req.userAgent || ''
      );

      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Search projects
   */
  static async searchProjects(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const projects = await ForumService.searchProjects(q as string);

      res.status(200).json({ projects, count: projects.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
