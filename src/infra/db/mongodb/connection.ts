import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/clients';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
} 