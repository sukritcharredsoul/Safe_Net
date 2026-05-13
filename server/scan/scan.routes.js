import multer from 'multer';
import express from 'express';

import authMiddleware from '../middleware/auth.middleware.js';
import checkfile from '../utils/mime.Validation.js';

import {
    getDomainReportController,
    getIPReportController,
    scanFileController,
    scanUrlController,
    getUrlReportController
} from './scan.controller.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * /api/v1/file:
 *   post:
 *     summary: Scan uploaded file for threats
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File scanned successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/file',
    upload.single('file'),
    checkfile,
    authMiddleware,
    scanFileController
);

/**
 * @swagger
 * /api/v1/url:
 *   post:
 *     summary: Scan a URL for malicious threats
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://example.com
 *     responses:
 *       200:
 *         description: URL scanned successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/url', authMiddleware, scanUrlController);

/**
 * @swagger
 * /api/v1/domain:
 *   get:
 *     summary: Get domain security report
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         example: google.com
 *     responses:
 *       200:
 *         description: Domain report fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/domain', authMiddleware, getDomainReportController);

/**
 * @swagger
 * /api/v1/ip:
 *   get:
 *     summary: Get IP security report
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ip
 *         required: true
 *         schema:
 *           type: string
 *         example: 8.8.8.8
 *     responses:
 *       200:
 *         description: IP report fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/ip', authMiddleware, getIPReportController);

/**
 * @swagger
 * /api/v1/url/report:
 *   get:
 *     summary: Get URL scan report
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scan report ID
 *     responses:
 *       200:
 *         description: URL report fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/url/report', authMiddleware, getUrlReportController);

export default router;