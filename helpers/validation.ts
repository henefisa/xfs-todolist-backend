import Joi from "joi";
import { ITodo } from "../models/todo.model";
import { IUser } from "../models/user.model";

const userValidate = (data: IUser) => {
  const userSchema = Joi.object({
    username: Joi.string().lowercase().required().trim(),
    password: Joi.string().min(4).max(32).required().trim(),
  });
  return userSchema.validate(data);
};

const todoValidate = (data: ITodo) => {
  const todoSchema = Joi.object({
    content: Joi.string().required().trim(),
    status: Joi.boolean(),
    date: Joi.date(),
    priority: Joi.number(),
  });
  return todoSchema.validate(data);
};

export { userValidate, todoValidate };
