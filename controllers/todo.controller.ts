import { Request, NextFunction, Response } from "express";
import createError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { todoValidate } from "../helpers/validation";
import Todo from "../models/todo.model";

const addTodo = async (
  request: Request,
  response: Response & JwtPayload,
  next: NextFunction
) => {
  try {
    const { error } = todoValidate(request.body);
    if (error) {
      throw createError(error.details[0].message);
    }

    const todo = new Todo({
      ...request.body,
      userId: response.payload.userId,
    });
    const savedTodo = await todo.save();

    response.json({
      status: "okay",
      elements: savedTodo,
    });
  } catch (error) {
    next(error);
  }
};

export { addTodo };
