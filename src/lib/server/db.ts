import mongoose from "mongoose";
import { seedCategories } from "./seed";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seedPromise: Promise<boolean> | null;
  seeded: boolean;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.__mongooseCache ?? {
  conn: null,
  promise: null,
  seedPromise: null,
  seeded: false,
};

globalForMongoose.__mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined. Add it to your .env file.");
  }

  if (!cached.conn) {
    if (!cached.promise) {
      cached.promise = mongoose.connect(mongoUri);
    }

    try {
      cached.conn = await cached.promise;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  if (!cached.seeded) {
    if (!cached.seedPromise) {
      cached.seedPromise = seedCategories();
    }

    const seeded = await cached.seedPromise;
    cached.seedPromise = null;

    if (seeded) {
      cached.seeded = true;
    }
  }

  return cached.conn;
}
