import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware, adminMiddleware, adminPanelAuthMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';

const router = Router();

// Admin panel routes with special auth middleware
router.use(authMiddleware);
router.use(adminPanelAuthMiddleware);

// User management
router.get('/users', AdminController.getUsers);
router.get('/users/search', AdminController.searchUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:userId/role', AdminController.changeUserRole);
router.post('/users/:userId/freeze', AdminController.freezeUser);
router.post('/users/:userId/unfreeze', AdminController.unfreezeUser);
router.delete('/users/:userId', AdminController.deleteUser);

// Logs
router.get('/logs/user/:userId', AdminController.getUserLogs);
router.get('/logs/action', AdminController.getActionLogs);
router.get('/logs/recent', AdminController.getRecentLogs);

export default router;
