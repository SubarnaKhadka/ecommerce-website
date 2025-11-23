import { MongoClient } from "mongodb";
import { config } from "../config";

const { mongo_uri, mongo_db_name } = config.database;

const client = new MongoClient(mongo_uri);
export const mongoDb = client.db(mongo_db_name);

export async function connectMongo() {
  await client.connect();
  console.log("Connected to MongoDB");
}
