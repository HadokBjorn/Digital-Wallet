import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { getTransactions, postTransaction } from "../controllers/transactions.controller.js";
import { transactionSchema } from "../schemas/transactions.schema.js";
import { authorization } from "../middlewares/auth.middleware.js";

const transactionsRouter = Router();

transactionsRouter.use(authorization);
transactionsRouter.get("/movimentacoes", getTransactions);
transactionsRouter.post("/transacao", validateSchema(transactionSchema), postTransaction);

export default transactionsRouter;
