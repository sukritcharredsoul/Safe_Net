import mongoose from 'mongoose'

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
    } ,
    riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    riskLevel: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "LOW"
    },
    totalEngines: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    maliciousCount: {
        type: Number,
        default: 0,
        min: 0
    },
    harmlessCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
}, 
    {
        timestamps : true,
    }
) ;


export default mongoose.model("FileHistory",fileHistorySchema) ;