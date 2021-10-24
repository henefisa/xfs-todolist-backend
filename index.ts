import express, { Request, Response, NextFunction } from "express";
import createError, { HttpError } from "http-errors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

// routes
import userRoute from "./routes/user.route";
import todoRoute from "./routes/todo.route";

const app = express();
const port = process.env.PORT || 7878;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);
app.use("/todo", todoRoute);

app.use((_request: Request, _response: Response, next: NextFunction) => {
  const error = createError();
  error.status = 500;
  error.message = "Not Found!";
  next(error);
});

app.use(
  (
    error: HttpError,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    response.status(error.status || 500).json({ message: error.message });
  }
);

if (!process.env.TEST) {
  mongoose
    .connect("mongodb://mongodb:27017/xfs")
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.error(error);
    });

  app.listen(port, () => {
    console.log(`App is listened on port ${port}`);
  });
}

export default app;
