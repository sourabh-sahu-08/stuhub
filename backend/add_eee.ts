import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('departments').updateOne(
    { code: 'EEE' },
    { 
      $set: { 
        name: 'Electrical and Electronics Engineering', 
        code: 'EEE', 
        description: 'Electrical machines, electronics, and power engineering.', 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        __v: 0 
      } 
    },
    { upsert: true }
  );
  console.log('Added EEE to remote MongoDB Atlas!');
  process.exit(0);
});
