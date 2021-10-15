import Joi from "joi";

const userValidate = (data: { username: string; password: string }) => {
  const userSchema = Joi.object({
    username: Joi.string().lowercase().required(),
    password: Joi.string().min(4).max(32).required(),
  });
  return userSchema.validate(data);
};

export { userValidate };
