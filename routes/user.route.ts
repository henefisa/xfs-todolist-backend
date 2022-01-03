import express from "express";
import {
  register,
  refreshToken,
  login,
  logout,
  isAuthenticated,
} from "../controllers/user.controller";
import * as middlewares from "../middlewares/auth.middleware";

const route = express.Router();
route.post("/register", register);
route.post("/refresh-token", refreshToken);
route.post("/login", login);
route.delete("/logout", logout);
route.get("/isAuthenticated", middlewares.isAuthenticated, isAuthenticated);

export default route;
