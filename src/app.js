import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import express, { json } from "express";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import { stripHtml } from "string-strip-html";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

const app = express();
const PORT = process.env.PORT || 5000;
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
const db = mongoClient.db("DigitalWallet");

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

const transactionSchema = joi.object({
	value: joi.number().precision(2).min(0.01).required(),
	type: joi.string().valid("entrada").valid("saida").required(),
});

const SomaArray = (arr) => {
	let soma = 0;
	for (let i = 0; i < arr.length; i++) {
		soma += arr[i].value;
	}
	return soma;
};

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

app.post("/login", async (req, res) => {
	const email = stripHtml(req.body.email).result.trim();
	const password = stripHtml(req.body.password).result.trim();
	const validation = loginSchema.validate({ email, password }, { abortEarly: false });

	if (validation.error) {
		const errors = validation.error.details.map((detail) => detail.message);
		return res.status(422).send(errors);
	}

	try {
		const findUser = await db.collection("usuarios").findOne({ email });
		if (!findUser) return res.status(404).send("E-mail não cadastrado!");
		const isPassword = bcrypt.compareSync(password, findUser.password);
		if (!isPassword) return res.status(401).send("Senha incorreta!");
		const token = uuid();
		await db.collection("sessoes").insertOne({ idUser: findUser._id, token });
		res.status(200).send(token);
	} catch (err) {
		res.status(500).send(err);
	}
});

app.get("/movimentacoes", async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.status(401).send("Token não encontrado!");
	try {
		const loggedUser = await db.collection("sessoes").findOne({ token });
		if (!loggedUser) return res.status(401).send("Token expirado ou inválido");
		const dateUser = await db.collection("usuarios").findOne({ _id: loggedUser.idUser });
		if (!dateUser) return res.status(500).send("Erro ao encontrar dados");
		const transactionUser = await db
			.collection("transacoes")
			.find({ user: loggedUser.idUser })
			.toArray();
		const entradas = transactionUser.filter((el) => el.type === "entrada");
		const saidas = transactionUser.filter((el) => el.type === "saida");

		const balance = SomaArray(entradas) - SomaArray(saidas);

		delete dateUser.email;
		delete dateUser.password;
		res.send({ name: dateUser.name, transactions: transactionUser, totalBalance: balance });
	} catch (err) {
		res.status(500).send(err);
	}
});

app.post("/transacao", async (req, res) => {
	const { authorization } = req.headers;
	const value = Number(stripHtml(req.body.value).result.trim());
	const type = stripHtml(req.body.type).result.trim();
	const validation = transactionSchema.validate({ value, type }, { abortEarly: false });

	if (validation.error) {
		const errors = validation.error.details.map((detail) => detail.message);
		return res.status(422).send(errors);
	}
	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.status(401).send("Token não encontrado!");
	try {
		const loggedUser = await db.collection("sessoes").findOne({ token });
		if (!loggedUser) return res.status(401).send("Token expirado ou inválido");
		const transaction = await db
			.collection("transacoes")
			.insertOne({ user: loggedUser.idUser, value, type, date: dayjs().format("DD/MM") });
		res.sendStatus(201);
	} catch (err) {
		res.status(500).send(err);
	}
});
app.listen(PORT, () => print(`Server online in port: ${PORT}`));
