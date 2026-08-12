import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';
import { Note } from './src/models/Note';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const user = await User.findOne({ name: 'Ishan Patel' });
  const notes = await Note.find({ user: user!._id }).sort({ createdAt: -1 }).limit(5);
  console.log("Ishan's 5 most recent notes:");
  notes.forEach(n => console.log(`${n.title} - ${n.createdAt}`));
  process.exit(0);
});
