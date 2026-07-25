import mongoose from "mongoose";
import { Subject } from "../models/Academic";
import { Department } from "../models/Academic";

async function check() {
  await mongoose.connect("mongodb://localhost:27017/stuhub");
  const it = await Department.findOne({ code: "IT" });
  console.log("IT Department:", it?._id);
  
  const subjects = await Subject.find({ department: it?._id, semester: 4, syllabus: "old" });
  console.log("Subjects for IT Sem 4 Old:", subjects);
  process.exit(0);
}

check();
