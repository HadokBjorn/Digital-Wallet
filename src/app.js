import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import express, { json } from "express";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import { stripHtml } from "string-strip-html";

const app = express();
const PORT = 5000;
const print = (value) => console.log(value);
app.use(json());
app.use(cors());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
} catch (err) {
	print(err.message);
}
const db = mongoClient.db();

//Estrutura de cadastro {name, email, password}

app.post("/cadastro", async (req, res) => {
	const { name, email, password } = req.body;
	try {
		const findUser = await db.collection("cadastro").findOne({ email });
		if (findUser) return res.status(409).send("E-mail já cadastrado!");
		const hash = bcrypt.hashSync(password, 10);
		await db.collection("usuario").insertOne({ name, email, password: hash });
	} catch (err) {
		res.status(500).send(err);
	}
});

//Estrutura de Login {email e password}

//Blocos de código do projeto

app.listen(PORT, () => print(`Server online in port: ${PORT}`));
