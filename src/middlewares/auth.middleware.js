import { db } from "../database/database.connection.js";

export const authorization = async (req, res, next) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.status(401).send("Token não encontrado!");
	try {
		const loggedUser = await db.collection("sessoes").findOne({ token });
		if (!loggedUser) return res.status(401).send("Token expirado ou inválido");
		res.locals.loggedUser = loggedUser;

		next();
	} catch (err) {
		res.status(500).send(err.message);
	}
};
