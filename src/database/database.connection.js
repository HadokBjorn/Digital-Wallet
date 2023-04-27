import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
} catch (err) {
	console.log(err.message);
}
export const db = mongoClient.db("DigitalWallet");
export const PORT = process.env.PORT || 5000;
