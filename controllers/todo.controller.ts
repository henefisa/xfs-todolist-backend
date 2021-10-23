import { Request, NextFunction, Response } from "express";
import createError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
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
      throw new createError[400](error.details[0].message);
    }

    delete request.body.date;

    const todo = new Todo({
      ...request.body,
      userId: response.payload.userId,
    });
    const savedTodo = await todo.save();

    response.status(201).json(savedTodo);
  } catch (error) {
    next(error);
  }
};

const editTodo = async (
  request: Request,
  response: Response & JwtPayload,
  next: NextFunction
) => {
  try {
    const { todoId } = request.params;

    const { error } = todoValidate(request.body);
    if (error) {
      throw new createError[400](error.details[0].message);
    }

    if (!mongoose.isValidObjectId(todoId)) {
      throw new createError.BadRequest();
    }

    const todo = await Todo.findById(todoId);

    if (!todo) {
      throw new createError.NotFound();
    }

    if (response.payload.userId.toString() !== todo.userId) {
      throw new createError.Forbidden();
    }

    const updatedTodo = await Todo.findByIdAndUpdate(todoId, request.body, {
      new: true,
    });

    response.status(201).json(updatedTodo);
  } catch (error) {
    next(error);
  }
};

const getAllTodo = async (
  request: Request,
  response: Response & JwtPayload,
  next: NextFunction
) => {
  try {
    const userId = response.payload.userId.toString();

    const todos = await Todo.find({ userId: userId });

    response.status(200).json({
      todos,
      count: todos.length,
    });
  } catch (error) {
    next(error);
  }
};

const getTodoById = async (
  request: Request,
  response: Response & JwtPayload,
  next: NextFunction
) => {
  try {
    const { todoId } = request.params;

    if (!mongoose.isValidObjectId(todoId)) {
      throw new createError.BadRequest();
    }

    const todo = await Todo.findById(todoId);

    if (!todo) {
      throw new createError.NotFound();
    }

    if (response.payload.userId.toString() !== todo.userId) {
      throw new createError.Forbidden();
    }

    response.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

const deleteTodoById = async (
  request: Request,
  response: Response & JwtPayload,
  next: NextFunction
) => {
  try {
    const { todoId } = request.params;

    if (!mongoose.isValidObjectId(todoId)) {
      throw new createError.BadRequest();
    }

    const userId = response.payload.userId.toString();
    const todo = await Todo.findById(todoId, { userId });

    if (!todo) {
      throw new createError.NotFound();
    }

    await todo.remove();

    response.status(204).json();
  } catch (error) {
    next(error);
  }
};

export { addTodo, editTodo, getAllTodo, getTodoById, deleteTodoById };
