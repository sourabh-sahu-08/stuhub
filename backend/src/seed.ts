import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { User } from "./models/User.js";
import { Course, Department, Student, Subject } from "./models/Academic.js";
import { Assignment, Attendance, Grade, Leave, Timetable } from "./models/Operations.js";
import { Alumni, Club, Event, Notice, Notification, Placement, Resource } from "./models/Campus.js";

await connectDatabase();

await Promise.all([
  User.deleteMany({}),
  Department.deleteMany({}),
  Course.deleteMany({}),
  Subject.deleteMany({}),
  Student.deleteMany({}),
  Assignment.deleteMany({}),
  Attendance.deleteMany({}),
  Grade.deleteMany({}),
  Leave.deleteMany({}),
  Timetable.deleteMany({}),
  Notice.deleteMany({}),
  Event.deleteMany({}),
  Placement.deleteMany({}),
  Resource.deleteMany({}),
  Club.deleteMany({}),
  Alumni.deleteMany({}),
  Notification.deleteMany({})
]);

const [cse, ece] = await Department.create([
  { name: "Computer Science and Engineering", code: "CSE", description: "Software, AI, systems, and data." },
  { name: "Electronics and Communication", code: "ECE", description: "Circuits, embedded systems, and communication." }
]);

const [btechCse] = await Course.create([
  { name: "B.Tech Computer Science", code: "BTECH-CSE", department: cse._id, durationYears: 4, semesters: 8 }
]);

const [studentUser] = await User.create([
  { name: "Riya Sharma", email: "student@collegeos.edu", password: "password123", role: "student", department: cse._id }
]);

const [dbms, os, ai] = await Subject.create([
  { name: "Database Management Systems", code: "CS301", course: btechCse._id, department: cse._id, credits: 4, semester: 5 },
  { name: "Operating Systems", code: "CS302", course: btechCse._id, department: cse._id, credits: 4, semester: 5 },
  { name: "Applied AI", code: "CS350", course: btechCse._id, department: cse._id, credits: 3, semester: 5 }
]);

await Student.create({
  user: studentUser._id,
  rollNumber: "CSE-2026-042",
  course: btechCse._id,
  department: cse._id,
  semester: 5,
  section: "A",
  cgpa: 8.42,
  feeStatus: "partial",
  skills: ["React", "Node.js", "MongoDB"]
});

console.log("Seeded College OS demo data (Clean Baseline)");
await mongoose.disconnect();
