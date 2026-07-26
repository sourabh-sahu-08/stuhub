import mongoose from "mongoose";
import dotenv from "dotenv";
import { Subject, Department } from "./models/Academic.js";

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB for migration");

    const subjects = await Subject.find({}).lean();
    let updatedCount = 0;

    for (const subject of subjects as any[]) {
      const updateData: any = { $set: {}, $unset: {} };
      let needsUpdate = false;

      // Migrate department to branches
      if (subject.department && (!subject.branches || subject.branches.length === 0)) {
        const dept = await Department.findById(subject.department);
        if (dept) {
          updateData.$set.branches = [dept.code];
          needsUpdate = true;
        }
      }

      // Migrate semester to semesters
      if (subject.semester !== undefined && (!subject.semesters || subject.semesters.length === 0)) {
        updateData.$set.semesters = [subject.semester];
        needsUpdate = true;
      }

      // Clean up old fields
      if (subject.department !== undefined) {
        updateData.$unset.department = 1;
        needsUpdate = true;
      }
      if (subject.semester !== undefined) {
        updateData.$unset.semester = 1;
        needsUpdate = true;
      }

      if (needsUpdate) {
        if (Object.keys(updateData.$set).length === 0) delete updateData.$set;
        if (Object.keys(updateData.$unset).length === 0) delete updateData.$unset;
        
        await Subject.updateOne({ _id: subject._id }, updateData);
        updatedCount++;
      }
    }

    console.log(`Migrated ${updatedCount} subjects to new schema structure.`);

    // Drop unique index on 'code' if it exists
    try {
      await Subject.collection.dropIndex("code_1");
      console.log("Successfully dropped unique index 'code_1'");
    } catch (err: any) {
      if (err.code === 27) {
        console.log("Index 'code_1' not found, no need to drop.");
      } else {
        console.error("Error dropping index:", err.message);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
