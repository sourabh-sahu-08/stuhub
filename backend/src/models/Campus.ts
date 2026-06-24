import mongoose, { Schema } from "mongoose";

export const Notice = mongoose.model(
  "Notice",
  new Schema(
    {
      title: { type: String, required: true },
      body: { type: String, required: true },
      audience: [{ type: String, enum: ["student", "all"], default: "student" }],
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      author: { type: Schema.Types.ObjectId, ref: "User" },
      pinned: { type: Boolean, default: false }
    },
    { timestamps: true }
  )
);

export const Event = mongoose.model(
  "Event",
  new Schema(
    {
      title: { type: String, required: true },
      description: String,
      startsAt: Date,
      endsAt: Date,
      venue: String,
      organizer: String,
      capacity: Number,
      registrations: [{ type: Schema.Types.ObjectId, ref: "Student" }]
    },
    { timestamps: true }
  )
);

export const Placement = mongoose.model(
  "Placement",
  new Schema(
    {
      title: { type: String, required: true },
      company: String,
      type: { type: String, enum: ["internship", "job"] },
      location: String,
      package: String,
      deadline: Date,
      skills: [String],
      applicants: [{ type: Schema.Types.ObjectId, ref: "Student" }]
    },
    { timestamps: true }
  )
);

export const Resource = mongoose.model(
  "Resource",
  new Schema(
    {
      title: { type: String, required: true },
      type: { type: String, enum: ["ebook", "notes", "paper", "syllabus", "video"] },
      subject: { type: Schema.Types.ObjectId, ref: "Subject" },
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      url: String,
      tags: [String],
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
  )
);

export const Club = mongoose.model(
  "Club",
  new Schema(
    {
      name: { type: String, required: true },
      description: String,
      category: String,
      members: [{ type: Schema.Types.ObjectId, ref: "Student" }]
    },
    { timestamps: true }
  )
);

export const Alumni = mongoose.model(
  "Alumni",
  new Schema(
    {
      name: { type: String, required: true },
      graduationYear: Number,
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      company: String,
      role: String,
      email: String,
      mentorshipAvailable: { type: Boolean, default: false }
    },
    { timestamps: true }
  )
);

export const Message = mongoose.model(
  "Message",
  new Schema(
    {
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      recipients: [{ type: Schema.Types.ObjectId, ref: "User" }],
      channel: { type: String, enum: ["direct", "class", "department", "announcement"], default: "direct" },
      body: String,
      readBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
  )
);

export const Notification = mongoose.model(
  "Notification",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      title: { type: String, required: true },
      body: String,
      type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
      readAt: Date,
      actionUrl: String
    },
    { timestamps: true }
  )
);
