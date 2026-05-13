import { Router } from 'express';
import { getActivity } from './activity.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/recent:
 *   get:
 *     summary: Get recent user activities
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities fetched successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/recent", authMiddleware, getActivity);

export default router;