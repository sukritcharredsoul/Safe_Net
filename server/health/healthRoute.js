import express from "express";
import healthController from './healthController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check server health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get("/health", healthController);

export default router;