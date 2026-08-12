import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';
import { Note } from './src/models/Note';
import { Pyq } from './src/models/Pyq';
import { CtPyq } from './src/models/CtPyq';
import { Assignment } from './src/models/Assignment';
import { Resource } from './src/models/Resource';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const user = await User.findOne({ name: 'Ishan Patel' });
  if (!user) {
    console.log("No Ishan found.");
    process.exit(0);
  }
  
  const notes = await Note.countDocuments({ user: user._id });
  const pyqs = await Pyq.countDocuments({ user: user._id });
  const ctpyqs = await CtPyq.countDocuments({ user: user._id });
  const assignments = await Assignment.countDocuments({ user: user._id });
  const resources = await Resource.countDocuments({ user: user._id });
  
  console.log(`Ishan Patel (${user._id}):`);
  console.log(`Notes: ${notes}`);
  console.log(`PYQs: ${pyqs}`);
  console.log(`CT-PYQs: ${ctpyqs}`);
  console.log(`Assignments: ${assignments}`);
  console.log(`Resources: ${resources}`);
  console.log(`Bonus Uploads: ${(user as any).gamification?.bonusUploads}`);
  
  console.log(`Total: ${notes + pyqs + ctpyqs + assignments + resources + ((user as any).gamification?.bonusUploads || 0)}`);
  
  process.exit(0);
});
