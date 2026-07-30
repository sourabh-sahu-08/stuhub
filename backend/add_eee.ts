import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/stuhub').then(async () => {
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
  console.log('Added EEE');
  process.exit(0);
});
