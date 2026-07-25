const mongoose = require("mongoose");

async function addNoteLink() {
  await mongoose.connect("mongodb://localhost:27017/stuhub");

  const db = mongoose.connection.db;
  
  // Find any user
  const user = await db.collection('users').findOne({});
  
  if (!user) {
    console.error("No user found in the DB. The upload will be unassociated.");
  }

  const result = await db.collection('notes').insertOne({
    user: user ? user._id : null,
    title: "AEC Drive Folder",
    subject: "AEC",
    semester: 4,
    syllabus: "old",
    branch: "IT",
    driveUrl: "https://drive.google.com/drive/folders/1c-PvBgtEc1X8TU-RlIHvBZwMooK2GhXI",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("Note link added successfully:", result);
  process.exit(0);
}

addNoteLink();
