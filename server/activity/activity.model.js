import mongoose from "mongoose";

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