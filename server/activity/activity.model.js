import mongoose from "mongoose";


/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6641a5d9c21f4f0012345678
 *
 *         userId:
 *           type: string
 *           description: Reference to the user
 *           example: 6641a5d9c21f4f0012345678
 *
 *         actionType:
 *           type: string
 *           enum:
 *             - URL_SCAN
 *             - FILE_SCAN
 *           example: URL_SCAN
 *
 *         input:
 *           type: string
 *           description: URL or file name submitted for scanning
 *           example: https://example.com
 *
 *         fileHistoryId:
 *           type: string
 *           description: Reference to file history document
 *           example: 6641a5d9c21f4f0012345678
 *
 *         result:
 *           type: object
 *           properties:
 *             riskScore:
 *               type: number
 *               example: 85
 *
 *             riskLevel:
 *               type: string
 *               example: High
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  actionType: {
    type: String,
    enum: ["URL_SCAN", "FILE_SCAN"],
    required: true
  },

  input: {
    type: String
  },

  
  fileHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FileHistory"
  },

  result: {
    riskScore: Number,
    riskLevel: String
  }

}, {
  timestamps: true
});

export const Activity = mongoose.model("Activity", activitySchema);