import JWT from "jsonwebtoken";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

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
          reject(error);
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
      expiresIn: "30d",
    };

    JWT.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      options,
      (error, token) => {
        if (error) {
          reject(error);
        }
        resolve(token);
      }
    );
  });
};

const verifyRefreshToken = (refreshToekn: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      return reject(new createError.InternalServerError());
    }

    JWT.verify(
      refreshToekn,
      process.env.REFRESH_TOKEN_SECRET,
      (error, payload) => {
        if (error) {
          return reject(error);
        }
        resolve(payload);
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
