import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ActivityLog } from './src/models/ActivityLog';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);
  console.log(logs);
  process.exit(0);
});
