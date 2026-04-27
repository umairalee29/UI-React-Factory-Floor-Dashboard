import mongoose from 'mongoose';

export default async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${uri}`);
  } catch (err) {
    console.error('MongoDB connection error:', (err as Error).message);
    process.exit(1);
  }
}
