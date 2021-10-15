import express, { Request, Response, NextFunction } from "express";
const route = express.Router();

route.post(
  "/register",
  (request: Request, response: Response, next: NextFunction) => {
    console.log("Register function");
    response.send("Register function");
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
  (request: Request, response: Response, next: NextFunction) => {
    console.log("Login function");
    response.send("Login function");
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
