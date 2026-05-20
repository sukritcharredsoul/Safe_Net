import mongoose from 'mongoose'

/**
 * @swagger
 * components:
 *   schemas:
 *     FileHistory:
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
 *         fileName:
 *           type: string
 *           example: malware.exe
 *
 *         fileHash:
 *           type: string
 *           description: Unique hash generated for the uploaded file
 *           example: d41d8cd98f00b204e9800998ecf8427e
 *
 *         maliciousCount:
 *           type: number
 *           minimum: 0
 *           example: 5
 *
 *         harmlessCount:
 *           type: number
 *           minimum: 0
 *           example: 62
 *
 *         scanId:
 *           type: string
 *           example: vt_scan_123456
 *
 *         scanStatus:
 *           type: string
 *           enum:
 *             - pending
 *             - completed
 *             - failed
 *           example: completed
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


const fileHistorySchema = new mongoose.Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref: "User",
        required : true
    },

    fileName : {
        type : String,
        required : true,
        trim : true
    },

    fileHash: {   // 
        type: String,
        required: true,
        index: true,
        unique : true
    },

    maliciousCount : {
        type : Number,
        required : true,
        min:0
    },

    harmlessCount : {
        type : Number,
        required : true,
        min:0
    },

    scanId : {
        type : String
    },

    scanStatus: {   // helps async workflows
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    }
    
}, 
    {
        timestamps : true,
    }
) ;


export default mongoose.model("FileHistory",fileHistorySchema) ;