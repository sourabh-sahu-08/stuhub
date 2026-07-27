import mongoose, { Schema, Document } from "mongoose";

export interface IResource extends Document {
  user: mongoose.Types.ObjectId; // Admin who added it
  title: string;
  url: string;
  type: "youtube" | "website";
  subject: string;
  semester: number; // 1 to 8
  syllabus: "new" | "old";
  branch: string; // IT, CSE, etc.
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["youtube", "website"], required: true },
    subject: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    syllabus: { type: String, enum: ["new", "old"], required: true },
    branch: { type: String, required: true },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>("Resource", resourceSchema);
