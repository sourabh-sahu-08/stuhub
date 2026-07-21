import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { User } from "./models/User.js";
import { Course, Department, Student, Subject } from "./models/Academic.js";
import { Assignment, Attendance, Leave, Timetable } from "./models/Operations.js";
import { Alumni, Club, Event, Notice, Notification, Placement, Resource } from "./models/Campus.js";
import { Pyq } from "./models/Pyq.js";
import { Note } from "./models/Note.js";

await connectDatabase();

await Promise.all([
  User.deleteMany({}),
  Department.deleteMany({}),
  Course.deleteMany({}),
  Subject.deleteMany({}),
  Student.deleteMany({}),
  Assignment.deleteMany({}),
  Attendance.deleteMany({}),
  Leave.deleteMany({}),
  Timetable.deleteMany({}),
  Notice.deleteMany({}),
  Event.deleteMany({}),
  Placement.deleteMany({}),
  Resource.deleteMany({}),
  Club.deleteMany({}),
  Alumni.deleteMany({}),
  Notification.deleteMany({}),
  Pyq.deleteMany({}),
  Note.deleteMany({})
]);

const [it, cse, mech, civil, mining, elec, entc] = await Department.create([
  { name: "Information Technology", code: "IT", description: "Systems, software, and database engineering." },
  { name: "Computer Science and Engineering", code: "CSE", description: "Computation, algorithms, and artificial intelligence." },
  { name: "Mechanical Engineering", code: "MECHNICAL", description: "Thermodynamics, robotics, and machine design." },
  { name: "Civil Engineering", code: "CIVIL", description: "Structures, environmental engineering, and infrastructures." },
  { name: "Mining Engineering", code: "MINING", description: "Resource extraction, minerals, and geology." },
  { name: "Electrical Engineering", code: "ELEC", description: "Power systems, circuits, and machinery." },
  { name: "Electronics and Telecommunication", code: "ELECTRONICS AND TELECOMMUNICATION", description: "Signals, communication systems, and electronic designs." }
]);

const [btechCse] = await Course.create([
  { name: "B.Tech Computer Science", code: "BTECH-CSE", department: cse._id, durationYears: 4, semesters: 8 }
]);

const [studentUser] = await User.create([
  { name: "Riya Sharma", email: "student@stuhub.edu", password: "password123", role: "student", department: cse._id }
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
  cgpa: 8.42,
  feeStatus: "partial",
  skills: ["React", "Node.js", "MongoDB"]
});

console.log("Seeded Stuhub demo data (Clean Baseline)");
await mongoose.disconnect();
