import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';
import { GamificationService } from './src/services/gamification.service';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  try {
    const user = await User.findOne({ name: 'Ishan Patel' });
    await GamificationService.logActivity(user!._id, 'UPLOAD_NOTE', undefined, undefined, 'Test');
    console.log("Success");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
