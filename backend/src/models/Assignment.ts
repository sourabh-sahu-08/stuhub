import mongoose, { Document, Schema } from "mongoose";

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  course?: string;
  description?: string;
  status: "Not Started" | "In Progress" | "Submitted";
  givenDate: Date;
  dueDate: Date;
  reminderTime?: Date;
  weight?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    course: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Submitted"],
      default: "Not Started",
    },
    givenDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    reminderTime: { type: Date },
    weight: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
