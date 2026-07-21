import mongoose, { Schema } from "mongoose";

export const Department = mongoose.model(
  "Department",
  new Schema(
    {
      name: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      description: String
    },
    { timestamps: true }
  )
);

export const Course = mongoose.model(
  "Course",
  new Schema(
    {
      name: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      durationYears: Number,
      semesters: Number
    },
    { timestamps: true }
  )
);

export const Subject = mongoose.model(
  "Subject",
  new Schema(
    {
      name: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      course: { type: Schema.Types.ObjectId, ref: "Course" },
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      credits: Number,
      semester: Number
    },
    { timestamps: true }
  )
);

export const Student = mongoose.model(
  "Student",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      rollNumber: { type: String, required: true, unique: true },
      course: { type: Schema.Types.ObjectId, ref: "Course" },
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      semester: Number,
      cgpa: { type: Number, default: 0 },
      feeStatus: { type: String, enum: ["paid", "partial", "due"], default: "due" },
      skills: [String],
      guardian: {
        name: String,
        phone: String
      }
    },
    { timestamps: true }
  )
);
