import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
//import { stripHtml } from "string-strip-html";
import { db } from "../database/database.connection.js";

export const signin = async (req, res) => {
	/* 
	Estava usando o strip para limpar possiveis tags html antes de passar pelo schema
	
	const email = stripHtml(req.body.email).result.trim();
	const password = stripHtml(req.body.password).result.trim();
	*/
	const { email, password } = req.body;

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
};

export const signup = async (req, res) => {
	/* 
	const name = stripHtml(req.body.name).result.trim();
	const email = stripHtml(req.body.email).result.trim();
	const password = stripHtml(req.body.password).result.trim();
	*/

	const { name, email, password } = req.body;

	try {
		const doubleUser = await db.collection("usuarios").findOne({ email });
		if (doubleUser) return res.status(409).send("E-mail já cadastrado!");
		const hash = bcrypt.hashSync(password, 10);
		await db.collection("usuarios").insertOne({ name, email, password: hash });
		res.sendStatus(201);
	} catch (err) {
		res.status(500).send(err);
	}
};
