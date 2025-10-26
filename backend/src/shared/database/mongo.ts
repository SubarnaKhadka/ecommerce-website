import { MongoClient } from "mongodb";

import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI!);
export const mongoDb = client.db(process.env.MONGO_DB_NAME!);

export async function connectMongo() {
  await client.connect();
  console.log("Connected to MongoDB");
}
