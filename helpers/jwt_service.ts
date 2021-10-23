import JWT, { JwtPayload } from "jsonwebtoken";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import client from "./connectRedis";

const signAccessToken = async (userId: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new createError.InternalServerError();
    }

    const options = {
      expiresIn: "1h",
    };

    JWT.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      options,
      (error, token) => {
        if (error) {
          return reject(new createError[401](error.message));
        }
        resolve(token);
      }
    );
  });
};

const verifyAccessToken = (
  request: Request,
  response: Response & JWT.JwtPayload,
  next: NextFunction
) => {
  if (!request.headers.authorization) {
    return next(new createError.Unauthorized());
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    return next(new createError.InternalServerError());
  }

  const token = request.headers.authorization.split(" ")[1];
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
    if (error) {
      if (error.name === "JsonWebTokenError") {
        return next(new createError.Unauthorized());
      }
      return next(new createError.Unauthorized(error.message));
    }
    response.payload = payload;
    next();
  });
};

const signRefreshToken = async (userId: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };

    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new createError.InternalServerError();
    }

    const options = {
      expiresIn: "10d",
    };

    JWT.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      options,
      (error, token) => {
        if (error) {
          reject(new createError[401](error.message));
        }
        client.set(userId.toString(), token as string, (error) => {
          if (error) {
            reject(new createError[500](error.message));
          }
        });
        client.expire(userId.toString(), 60 * 60 * 24 * 10);
        resolve(token);
      }
    );
  });
};

const verifyRefreshToken = (refreshToken: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      return reject(new createError.InternalServerError());
    }

    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, payload) => {
        if (error) {
          return reject(new createError[401](error.message));
        }
        resolve(payload as JwtPayload);
      }
    );
  });
};

export {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
