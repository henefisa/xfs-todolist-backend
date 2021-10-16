import express from "express";
import { addTodo } from "../controllers/todo.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const route = express.Router();
route.post("/add", isAuthenticated, addTodo);

export default route;
