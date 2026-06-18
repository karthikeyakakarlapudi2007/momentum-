import mongoose from 'mongoose';

let connected = false;

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not set in the environment');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    connected = true;
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
}

export function isDBConnected() {
  return connected;
}