import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';

const router = Router();

// Public routes
router.get('/articles/:articleId', optionalAuthMiddleware, CommentController.getArticleComments);
router.get('/projects/:projectId', optionalAuthMiddleware, CommentController.getProjectComments);

// Authenticated routes
router.post('/', authMiddleware, CommentController.createComment);
router.put('/:id', authMiddleware, CommentController.updateComment);
router.delete('/:id', authMiddleware, CommentController.deleteComment);
router.post('/:id/report', authMiddleware, CommentController.reportComment);
router.post('/:id/like', authMiddleware, CommentController.likeComment);
router.post('/:id/dislike', authMiddleware, CommentController.dislikeComment);

// Admin/Editor routes
router.get('/reported', authMiddleware, CommentController.getReportedComments);

export default router;
