import mongoose, { Schema, type InferSchemaType } from "mongoose";

const activityLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actionType: { 
      type: String, 
      enum: ["UPLOAD_NOTE", "UPLOAD_PYQ", "UPLOAD_CTPYQ", "UPLOAD_ASSIGNMENT", "RECEIVED_LIKE", "RECEIVED_DOWNLOAD", "STREAK_BONUS", "ACHIEVEMENT_UNLOCKED"],
      required: true 
    },
    xpEarned: { type: Number, default: 0 },
    itemRef: { type: Schema.Types.ObjectId }, // ID of the note/pyq
    itemModel: { type: String }, // 'Note', 'Pyq', etc.
    description: { type: String } // e.g. "Uploaded DBMS Notes"
  },
  { timestamps: true }
);

export type ActivityLogDocument = InferSchemaType<typeof activityLogSchema>;
export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
