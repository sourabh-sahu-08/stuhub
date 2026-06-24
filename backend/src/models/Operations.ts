import mongoose, { Schema } from "mongoose";

export const Attendance = mongoose.model(
  "Attendance",
  new Schema(
    {
      student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
      subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
      teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
      date: { type: Date, required: true },
      status: { type: String, enum: ["present", "absent", "late"], required: true }
    },
    { timestamps: true }
  )
);

export const Assignment = mongoose.model(
  "Assignment",
  new Schema(
    {
      title: { type: String, required: true },
      description: String,
      subject: { type: Schema.Types.ObjectId, ref: "Subject" },
      teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
      dueAt: Date,
      points: Number,
      attachments: [String],
      status: { type: String, enum: ["draft", "published", "closed"], default: "published" }
    },
    { timestamps: true }
  )
);

export const Submission = mongoose.model(
  "Submission",
  new Schema(
    {
      assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
      student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
      fileUrl: String,
      comment: String,
      submittedAt: Date,
      score: Number,
      status: { type: String, enum: ["submitted", "graded", "late"], default: "submitted" }
    },
    { timestamps: true }
  )
);

export const Grade = mongoose.model(
  "Grade",
  new Schema(
    {
      student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
      subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
      marks: Number,
      maxMarks: Number,
      grade: String,
      examType: { type: String, enum: ["internal", "midterm", "final", "practical"] }
    },
    { timestamps: true }
  )
);

export const Timetable = mongoose.model(
  "Timetable",
  new Schema(
    {
      course: { type: Schema.Types.ObjectId, ref: "Course" },
      semester: Number,
      section: String,
      entries: [
        {
          day: String,
          startsAt: String,
          endsAt: String,
          subject: { type: Schema.Types.ObjectId, ref: "Subject" },
          teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
          room: String
        }
      ]
    },
    { timestamps: true }
  )
);

export const Leave = mongoose.model(
  "Leave",
  new Schema(
    {
      student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
      reason: String,
      from: Date,
      to: Date,
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "Teacher" }
    },
    { timestamps: true }
  )
);
