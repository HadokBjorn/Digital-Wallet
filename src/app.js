import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import express, { json } from "express";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import { stripHtml } from "string-strip-html";
import { v4 as uuid } from "uuid";

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

const userSchema = joi.object({
	name: joi.string().required(),
	email: joi
		.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required(),
	password: joi.string().min(3).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

const loginSchema = joi.object({
	email: joi
		.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required(),
	password: joi.string().min(3).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

app.post("/cadastro", async (req, res) => {
	const name = stripHtml(req.body.name).result.trim();
	const email = stripHtml(req.body.email).result.trim();
	const password = stripHtml(req.body.password).result.trim();

	const validation = userSchema.validate({ name, email, password }, { abortEarly: false });

	if (validation.error) {
		const errors = validation.error.details.map((detail) => detail.message);
		return res.status(422).send(errors);
	}

	try {
		const doubleUser = await db.collection("usuarios").findOne({ email });
		if (doubleUser) return res.status(409).send("E-mail já cadastrado!");
		const hash = bcrypt.hashSync(password, 10);
		await db.collection("usuarios").insertOne({ name, email, password: hash });
		res.sendStatus(201);
	} catch (err) {
		res.status(500).send(err);
	}
});

app.listen(PORT, () => print(`Server online in port: ${PORT}`));
