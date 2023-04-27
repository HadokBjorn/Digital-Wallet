//import { stripHtml } from "string-strip-html";
import dayjs from "dayjs";
import { db } from "../database/database.connection.js";

const SomaArray = (arr) => {
	let soma = 0;
	for (let i = 0; i < arr.length; i++) {
		soma += arr[i].value;
	}
	return soma;
};

export const getTransactions = async (req, res) => {
	const loggedUser = res.locals.loggedUser;
	try {
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
		res.send({
			name: dateUser.name,
			transactions: transactionUser.reverse(),
			totalBalance: balance,
		});
	} catch (err) {
		res.status(500).send(err);
	}
};

export const postTransaction = async (req, res) => {
	/* 
	const value = Number(stripHtml(req.body.value).result.trim());
	const type = stripHtml(req.body.type).result.trim();
	const title = stripHtml(req.body.title).result.trim();
	*/
	const { value, type, title } = req.body;
	const loggedUser = res.locals.loggedUser;

	try {
		await db
			.collection("transacoes")
			.insertOne({
				user: loggedUser.idUser,
				value: Number(value),
				type,
				title,
				date: dayjs().format("DD/MM"),
			});
		res.sendStatus(201);
	} catch (err) {
		res.status(500).send(err);
	}
};
