import { NextFunction, Response, Request } from "express";
import { verifyAccessToken } from "../helpers/jwt_service";

const isAuthenticated = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  return verifyAccessToken(request, response, next);
};

export { isAuthenticated };
