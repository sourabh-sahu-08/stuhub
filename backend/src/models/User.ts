import bcrypt from "bcryptjs";
import mongoose, { Schema, type InferSchemaType } from "mongoose";
import type { Role } from "../types.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin", "co-owner", "owner"], default: "student", required: true },
    avatar: String,
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    branch: { type: String },
    semester: { type: Number },
    rollNumber: { type: String },
    isProfileComplete: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    // User Preferences
    stealthMode: { type: Boolean, default: false },
    publicDiscovery: { type: Boolean, default: true },
    notifications: {
      upcomingDeadlines: { type: Boolean, default: true },
      aiAnalysisComplete: { type: Boolean, default: true },
      peerActivity: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  comparePassword(candidate: string): Promise<boolean>;
  role: Role;
};

export const User = mongoose.model("User", userSchema);
