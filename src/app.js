import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import router from "./routes/index.routes.js";
import { PORT } from "./database/database.connection.js";

const app = express();
app.use(json());
app.use(cors());
dotenv.config();
app.use(router);

app.listen(PORT, () => console.log(`Server online in port: ${PORT}`));
