import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('departments').updateOne(
    { name: 'Electronics and Telecommunication' },
    { 
      $set: { 
        code: 'ET&T', 
        updatedAt: new Date()
      } 
    }
  );
  console.log('Updated ET&T in remote MongoDB Atlas!');
  process.exit(0);
});
