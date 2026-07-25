import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Department, Subject } from "../models/Academic.js";

const MONGO_URI = env.MONGODB_URI || "mongodb://localhost:27017/stuhub";

const oldSubjects = [
  { name: "Analog Electronics", code: "AEC" },
  { name: "Operating System", code: "OS" },
  { name: "Database Management System", code: "DBMS" },
  { name: "Data Structures", code: "DS" },
  { name: "Internet of Things", code: "IOT" },
];

async function seedOldSubjects() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    let itDept = await Department.findOne({ code: "IT" });
    if (!itDept) {
      console.log("IT Department not found. Creating...");
      itDept = await Department.create({ name: "Information Technology", code: "IT" });
    }

    for (const subj of oldSubjects) {
      const existing = await Subject.findOne({ code: subj.code, syllabus: "old" });
      if (!existing) {
        await Subject.create({
          name: subj.name,
          code: subj.code,
          department: itDept._id,
          semester: 4,
          syllabus: "old"
        });
        console.log(`Inserted ${subj.name} (${subj.code})`);
      } else {
        console.log(`${subj.code} already exists.`);
      }
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedOldSubjects();
