import joi from "joi";

export const userSchema = joi.object({
	name: joi.string().required(),
	email: joi
		.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required(),
	password: joi.string().min(3).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});
export const loginSchema = joi.object({
	email: joi
		.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required(),
	password: joi.string().min(3).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});
