import express, { Request, Response, NextFunction } from "express";
import createError, { HttpError } from "http-errors";
import dotenv from "dotenv";
dotenv.config();

// routes
import userRoute from "./routes/user.route";

const app = express();
const port = process.env.PORT || 7878;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);

app.use((_request: Request, _response: Response, next: NextFunction) => {
  const error = createError();
  error.status = 500;
  error.message = "Failed!";
  next(error);
});

app.use(
  (
    error: HttpError,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    response.json({ status: error.status || 500, message: error.message });
  }
);

const server = app.listen(port, () => {
  console.log(`App is listened on port ${port}`);
});

process.on("SIGINT", () => {
  console.log("exit");
  server.close();
});
