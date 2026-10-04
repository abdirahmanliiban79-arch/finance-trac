/**
 * Global test setup: spins up an in-memory MongoDB instance before all tests
 * and tears it down after. Each test file that needs the DB should import
 * mongoose and use the connection that is already established here.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach } from "vitest";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = "test_jwt_secret_32_characters_long!!";
  (process.env as Record<string, string | undefined>).NODE_ENV = "test";

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  // Clear all collections between tests for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  const globalObj = globalThis as unknown as { __mongooseCache?: { seeded?: boolean } };
  if (globalObj.__mongooseCache) {
    globalObj.__mongooseCache.seeded = false;
  }
});
