import express from "express";
import {
  addTodo,
  deleteTodoById,
  editTodo,
  getAllTodo,
  getTodoById,
} from "../controllers/todo.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const route = express.Router();

route.post("/add", isAuthenticated, addTodo);
route.post("/edit/:todoId", isAuthenticated, editTodo);
route.get("/", isAuthenticated, getAllTodo);
route.get("/:todoId", isAuthenticated, getTodoById);
route.delete("/:todoId", isAuthenticated, deleteTodoById);

export default route;
