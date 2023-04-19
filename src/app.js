import express, { json } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { stripHtml } from 'string-strip-html';
import dotenv from 'dotenv';
import cors from 'cors';
import joi from 'joi';

const app = express();
const PORT = 5000;
const print = (value) => console.log(value);
app.use(json());
app.use(cors());
dotenv.config();

// eslint-disable-next-line no-undef
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
} catch (err) {
	print(err.message);
}
const db = mongoClient.db();

//Blocos de código do projeto

app.listen(PORT, () => print(`Server online in port: ${PORT}`));
