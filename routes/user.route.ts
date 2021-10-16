import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { userValidate } from "../helpers/validation";
import { signAccessToken } from "../helpers/jwt_service";

import User from "../models/user.model";

const route = express.Router();

route.post(
  "/register",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { username, password } = request.body;
      const { error } = userValidate(request.body);
      if (error) {
        throw createError(error.details[0].message);
      }

      const isExist = await User.findOne({
        username,
      });

      if (isExist) {
        throw new createError.Conflict(`Username ${username} is already used!`);
      }

      const user = new User({ username, password });
      const savedUser = await user.save();

      response.json({
        status: "okay",
        elements: savedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

route.post(
  "/refresh-token",
  (request: Request, response: Response, next: NextFunction) => {
    console.log("Refresh token function");
    response.send("Refresh token function");
  }
);

route.post(
  "/login",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { error } = userValidate(request.body);
      if (error) {
        throw createError(error.details[0].message);
      }

      const { username, password } = request.body;
      const user = await User.findOne({ username });
      if (!user) {
        throw new createError.NotFound("User not registered");
      }

      const isValid = await user.checkPassword(password);

      if (!isValid) {
        throw new createError.Unauthorized();
      }
      const accessToken = await signAccessToken(user._id);
      response.json({
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

route.post(
  "/logout",
  (request: Request, response: Response, next: NextFunction) => {
    console.log("Logout function");
    response.send("Logout function");
  }
);

export default route;
