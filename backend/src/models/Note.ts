import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  title: string;
  subject: string;
  semester: number; // 1 to 8
  syllabus: "new" | "old";
  branch: string; // IT, CSE, MECHNICAL, etc.
  fileData: string; // Base64 representation of file
  mimeType: string; // File mime type
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    syllabus: { type: String, enum: ["new", "old"], required: true },
    branch: { type: String, required: true },
    fileData: { type: String, required: true },
    mimeType: { type: String, required: true }
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
