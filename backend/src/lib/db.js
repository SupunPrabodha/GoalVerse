import mongoose from "mongoose";

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  try {
    // Disable buffering so operations fail fast when disconnected
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, { autoIndex: true, serverSelectionTimeoutMS: 8000, socketTimeoutMS: 12000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // throw error so caller can decide how to handle it (don't exit here)
    throw err;
  }
}

export function isDbReady() {
  // readyState 1 = connected
  return mongoose.connection && mongoose.connection.readyState === 1;
}
