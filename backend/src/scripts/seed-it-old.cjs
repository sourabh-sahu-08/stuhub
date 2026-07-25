const mongoose = require("mongoose");

async function seedSubjects() {
  await mongoose.connect("mongodb://localhost:27017/stuhub");
  const db = mongoose.connection.db;

  const subjects = [
    { name: "Analog Electronics", code: "AEC", branch: "IT", semester: 4, syllabus: "old" },
    { name: "Operating System", code: "OS", branch: "IT", semester: 4, syllabus: "old" },
    { name: "Database Management System", code: "DBMS", branch: "IT", semester: 4, syllabus: "old" },
    { name: "Data Structures", code: "DS", branch: "IT", semester: 4, syllabus: "old" },
    { name: "Internet of Things", code: "IOT", branch: "IT", semester: 4, syllabus: "old" }
  ];

  for (const s of subjects) {
    await db.collection('academics').updateOne(
      { code: s.code, branch: s.branch, semester: s.semester, syllabus: s.syllabus },
      { $set: { ...s, createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true }
    );
  }

  // Also make sure the note I just created has subject: "AEC"
  await db.collection('notes').updateMany(
    { title: "AEC Drive Folder" },
    { $set: { subject: "AEC" } }
  );

  console.log("Subjects seeded successfully!");
  process.exit(0);
}

seedSubjects();
