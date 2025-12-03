import { Router } from 'express';
import { ForumController } from '../controllers/forumController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';

const router = Router();

// Public routes
router.get('/projects', optionalAuthMiddleware, apiRateLimiter, ForumController.getProjects);
router.get('/projects/popular', apiRateLimiter, ForumController.getPopularProjects);
router.get('/projects/:id', optionalAuthMiddleware, apiRateLimiter, ForumController.getProject);
router.get('/search', apiRateLimiter, ForumController.searchProjects);

// Authenticated routes
router.post('/projects', authMiddleware, ForumController.createProject);
router.put('/projects/:id', authMiddleware, ForumController.updateProject);
router.post('/projects/:id/like', authMiddleware, ForumController.likeProject);
router.post('/projects/:id/dislike', authMiddleware, ForumController.dislikeProject);
router.delete('/projects/:id', authMiddleware, ForumController.deleteProject);

export default router;
