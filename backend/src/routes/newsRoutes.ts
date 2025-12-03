import { Router } from 'express';
import { NewsController } from '../controllers/newsController';
import { authMiddleware, optionalAuthMiddleware, editorMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';

const router = Router();

// Public routes
router.get('/articles', optionalAuthMiddleware, apiRateLimiter, NewsController.getArticles);
router.get('/articles/:slug', optionalAuthMiddleware, apiRateLimiter, NewsController.getArticle);
router.get('/search', apiRateLimiter, NewsController.searchArticles);

// Authenticated routes
router.post('/articles', authMiddleware, editorMiddleware, NewsController.createArticle);
router.put('/articles/:id', authMiddleware, editorMiddleware, NewsController.updateArticle);
router.post('/articles/:id/publish', authMiddleware, editorMiddleware, NewsController.publishArticle);
router.delete('/articles/:id', authMiddleware, editorMiddleware, NewsController.deleteArticle);

export default router;
