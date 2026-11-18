import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'delivery_bd2';

if (!uri) {
  throw new Error('Falta definir MONGODB_URI en el archivo .env');
}

const client = new MongoClient(uri);

export async function connectDB() {
  await client.connect();
  return client.db(dbName);
}

export async function closeDB() {
  await client.close();
}