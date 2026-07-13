import mongoose, { Schema, Document } from "mongoose";

export interface IPyq extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  paperName: string;
  subject: string;
  semester: number; // 1 to 8
  fileData: string; // Base64 representation of file
  mimeType: string; // File mime type
  createdAt: Date;
  updatedAt: Date;
}

const pyqSchema = new Schema<IPyq>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    paperName: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    fileData: { type: String, required: true },
    mimeType: { type: String, required: true }
  },
  { timestamps: true }
);

export const Pyq = mongoose.model<IPyq>("Pyq", pyqSchema);
