import { Router } from "express";
import { signin, signup } from "../controllers/user.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { loginSchema, userSchema } from "../schemas/user.schema.js";

const userRouter = Router();

userRouter.post("/cadastro", validateSchema(userSchema), signup);
userRouter.post("/login", validateSchema(loginSchema), signin);

export default userRouter;
