import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userBadgeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeId: { 
      type: String, 
      required: true // e.g. "TOP_CONTRIBUTOR", "7_DAY_STREAK", "FIRST_UPLOAD", "KNOWLEDGE_HERO"
    },
    title: { type: String, required: true }, // e.g. "Top Contributor"
    description: { type: String },
    iconUrl: { type: String },
    earnedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// A user can only earn a specific badge once
userBadgeSchema.index({ user: 1, badgeId: 1 }, { unique: true });

export type UserBadgeDocument = InferSchemaType<typeof userBadgeSchema>;
export const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
