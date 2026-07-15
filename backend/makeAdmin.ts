import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { User } from "./src/models/User.js";

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide an email address. Usage: npm run make-admin <email>");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`Success! User ${email} has been promoted to Admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to upgrade user:", error);
    process.exit(1);
  }
}

makeAdmin();
