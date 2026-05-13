import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { checkEmail } from "./breach.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/breach:
 *   get:
 *     summary: Check if user email is involved in a data breach
 *     tags: [Breach]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email address to check for breaches
 *         example: tanisha@gmail.com
 *     responses:
 *       200:
 *         description: Breach check completed successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: No breach information found
 */
router.get("/breach", authMiddleware, checkEmail);

export default router;