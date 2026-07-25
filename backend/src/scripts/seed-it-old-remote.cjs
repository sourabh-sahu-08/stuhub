require("dotenv").config();
const mongoose = require("mongoose");

const academics = [
  { branch: "IT", semester: 4, syllabus: "old", subject: { name: "Analog Electronics", code: "AEC" } },
  { branch: "IT", semester: 4, syllabus: "old", subject: { name: "Operating System", code: "OS" } },
  { branch: "IT", semester: 4, syllabus: "old", subject: { name: "Database Management System", code: "DBMS" } },
  { branch: "IT", semester: 4, syllabus: "old", subject: { name: "Data Structures", code: "DS" } },
  { branch: "IT", semester: 4, syllabus: "old", subject: { name: "Internet of Things", code: "IoT" } }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  for (const item of academics) {
    await db.collection("academics").updateOne(
      { branch: item.branch, semester: item.semester, syllabus: item.syllabus, "subject.code": item.subject.code },
      { $set: item },
      { upsert: true }
    );
  }
  console.log("Seeded successfully!");
  process.exit(0);
}

seed();
