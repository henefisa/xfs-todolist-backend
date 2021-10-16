import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { userValidate } from "../helpers/validation";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt_service";
import client from "../helpers/connectRedis";
import User from "../models/user.model";

const register = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
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
};

const refreshToken = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: bodyRefreshToken } = request.body;
    if (!bodyRefreshToken) {
      throw new createError.BadRequest();
    }

    const { userId } = await verifyRefreshToken(bodyRefreshToken);

    client.get(userId.toString(), (error) => {
      if (error) {
        throw new createError.InternalServerError();
      }
    });

    const accessToken = await signAccessToken(userId);
    const refreshToken = await signRefreshToken(userId);
    response.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
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
    const refreshToken = await signRefreshToken(user._id);

    response.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: bodyRefreshToken } = request.body;
    if (!bodyRefreshToken) {
      throw new createError.BadRequest();
    }

    const { userId } = await verifyRefreshToken(bodyRefreshToken);
    client.del(userId.toString(), (error) => {
      if (error) {
        throw new createError.InternalServerError();
      }

      response.json({
        message: "Logout",
      });
    });
  } catch (error) {
    next(error);
  }
};

export { register, refreshToken, login, logout };
