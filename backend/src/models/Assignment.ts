import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  semester: number; // 1 to 8
  syllabus: "new" | "old";
  branch: string; // IT, CSE, MECHNICAL, etc.
  fileName?: string;
  fileData?: string; // Base64 representation of file
  mimeType?: string; // File mime type
  driveUrl?: string; // Drive link for the note
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    syllabus: { type: String, enum: ["new", "old"], required: true },
    branch: { type: String, required: true },
    fileName: { type: String },
    fileData: { type: String },
    mimeType: { type: String },
    driveUrl: { type: String }
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
