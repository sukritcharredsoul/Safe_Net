import { Activity } from './activity.model.js';

export const logActivity = async ({ userId, actionType, input, result, fileHistoryId }) => {
  try {
    await Activity.create({
      userId,
      actionType,
      input,
      result,
      fileHistoryId
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};