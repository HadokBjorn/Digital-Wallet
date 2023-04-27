import joi from "joi";

export const transactionSchema = joi.object({
	value: joi.number().precision(2).min(0.01).required(),
	type: joi.string().valid("entrada").valid("saida").required(),
	title: joi.string().min(3).required(),
});
