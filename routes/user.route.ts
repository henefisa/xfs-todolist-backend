import express from "express";
import {
  register,
  refreshToken,
  login,
  logout,
} from "../controllers/user.controller";

const route = express.Router();
route.post("/register", register);
route.post("/refresh-token", refreshToken);
route.post("/login", login);
route.delete("/logout", logout);

export default route;
