import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { User } from "./models/User.js";
import { Course, Department, Student, Subject, Teacher } from "./models/Academic.js";
import { Assignment, Attendance, Grade, Leave, Timetable } from "./models/Operations.js";
import { Alumni, Club, Event, Notice, Notification, Placement, Resource } from "./models/Campus.js";

await connectDatabase();

await Promise.all([
  User.deleteMany({}),
  Department.deleteMany({}),
  Course.deleteMany({}),
  Subject.deleteMany({}),
  Student.deleteMany({}),
  Teacher.deleteMany({}),
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

const [adminUser, teacherUser, studentUser] = await User.create([
  { name: "Aarav Mehta", email: "admin@collegeos.edu", password: "password123", role: "admin", department: cse._id },
  { name: "Dr. Kavya Rao", email: "teacher@collegeos.edu", password: "password123", role: "teacher", department: cse._id },
  { name: "Riya Sharma", email: "student@collegeos.edu", password: "password123", role: "student", department: cse._id }
]);

const teacher = await Teacher.create({
  user: teacherUser._id,
  employeeId: "TCH-1001",
  department: cse._id,
  designation: "Assistant Professor",
  officeHours: "Mon, Wed 2:00 PM - 4:00 PM"
});

const [dbms, os, ai] = await Subject.create([
  { name: "Database Management Systems", code: "CS301", course: btechCse._id, department: cse._id, teacher: teacher._id, credits: 4, semester: 5 },
  { name: "Operating Systems", code: "CS302", course: btechCse._id, department: cse._id, teacher: teacher._id, credits: 4, semester: 5 },
  { name: "Applied AI", code: "CS350", course: btechCse._id, department: cse._id, teacher: teacher._id, credits: 3, semester: 5 }
]);

teacher.subjects = [dbms._id, os._id, ai._id];
await teacher.save();

const student = await Student.create({
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

await Assignment.create([
  { title: "Normalize a campus database", description: "Design ERD and normalize to 3NF.", subject: dbms._id, teacher: teacher._id, dueAt: addDays(4), points: 20 },
  { title: "CPU scheduling simulator", description: "Compare FCFS, SJF, and Round Robin.", subject: os._id, teacher: teacher._id, dueAt: addDays(8), points: 25 },
  { title: "AI study planner prompt", description: "Prototype a useful study planner flow.", subject: ai._id, teacher: teacher._id, dueAt: addDays(12), points: 15 }
]);

await Attendance.create(
  Array.from({ length: 24 }).map((_, index) => ({
    student: student._id,
    subject: [dbms, os, ai][index % 3]._id,
    teacher: teacher._id,
    date: addDays(-index),
    status: index % 7 === 0 ? "absent" : index % 5 === 0 ? "late" : "present"
  }))
);

await Grade.create([
  { student: student._id, subject: dbms._id, marks: 43, maxMarks: 50, grade: "A", examType: "internal" },
  { student: student._id, subject: os._id, marks: 39, maxMarks: 50, grade: "B+", examType: "internal" },
  { student: student._id, subject: ai._id, marks: 46, maxMarks: 50, grade: "A+", examType: "internal" }
]);

await Timetable.create({
  course: btechCse._id,
  semester: 5,
  section: "A",
  entries: [
    { day: "Monday", startsAt: "09:00", endsAt: "10:00", subject: dbms._id, teacher: teacher._id, room: "A-203" },
    { day: "Tuesday", startsAt: "11:00", endsAt: "12:00", subject: os._id, teacher: teacher._id, room: "Lab-2" },
    { day: "Wednesday", startsAt: "13:00", endsAt: "14:00", subject: ai._id, teacher: teacher._id, room: "AI Studio" }
  ]
});

await Notice.create([
  { title: "Hack Week registrations are open", body: "Build campus tech products with mentors and alumni.", audience: ["all"], author: adminUser._id, pinned: true },
  { title: "DBMS internal assessment schedule", body: "Internal assessment starts next Monday.", audience: ["student"], department: cse._id, author: teacherUser._id },
  { title: "Faculty workshop on outcome mapping", body: "All teachers are invited to the IQAC workshop.", audience: ["teacher"], author: adminUser._id }
]);

await Event.create([
  { title: "Founders Friday", description: "Student startup demos and investor Q&A.", startsAt: addDays(6), endsAt: addDays(6), venue: "Auditorium", organizer: "E-Cell", capacity: 180 },
  { title: "AI Research Colloquium", description: "Talks from faculty and alumni researchers.", startsAt: addDays(10), endsAt: addDays(10), venue: "Seminar Hall", organizer: "CSE Department", capacity: 120 }
]);

await Placement.create([
  { title: "Frontend Engineering Intern", company: "Nova Labs", type: "internship", location: "Remote", package: "25k/month", deadline: addDays(9), skills: ["React", "TypeScript"] },
  { title: "Associate Software Engineer", company: "CloudPeak", type: "job", location: "Bengaluru", package: "8 LPA", deadline: addDays(18), skills: ["DSA", "Node.js", "MongoDB"] }
]);

await Resource.create([
  { title: "DBMS Normalization Notes", type: "notes", subject: dbms._id, department: cse._id, url: "https://example.com/dbms-notes.pdf", tags: ["dbms", "normalization"], uploadedBy: teacherUser._id },
  { title: "Operating Systems Previous Papers", type: "paper", subject: os._id, department: cse._id, url: "https://example.com/os-papers.pdf", tags: ["os", "pyq"], uploadedBy: teacherUser._id },
  { title: "CSE Semester 5 Syllabus", type: "syllabus", department: cse._id, url: "https://example.com/syllabus.pdf", tags: ["syllabus"], uploadedBy: adminUser._id }
]);

await Club.create([
  { name: "CodeCell", description: "Competitive programming and software projects.", category: "Technical", facultyLead: teacher._id, members: [student._id] },
  { name: "Design Guild", description: "Product design, branding, and creative systems.", category: "Creative", members: [student._id] }
]);

await Alumni.create([
  { name: "Neha Iyer", graduationYear: 2021, department: cse._id, company: "GitHub", role: "Software Engineer", email: "neha@example.com", mentorshipAvailable: true },
  { name: "Kabir Khan", graduationYear: 2019, department: ece._id, company: "Tesla", role: "Embedded Systems Lead", email: "kabir@example.com", mentorshipAvailable: true }
]);

await Leave.create({ student: student._id, reason: "Medical appointment", from: addDays(2), to: addDays(2), status: "pending" });

await Notification.create([
  { user: studentUser._id, title: "Assignment due soon", body: "DBMS assignment is due in 4 days.", type: "warning", actionUrl: "/assignments" },
  { user: teacherUser._id, title: "Leave request pending", body: "One student leave request needs review.", type: "info", actionUrl: "/teacher/leaves" },
  { user: adminUser._id, title: "Monthly report ready", body: "College activity snapshot is available.", type: "success", actionUrl: "/admin/reports" }
]);

console.log("Seeded College OS demo data");
await mongoose.disconnect();

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
