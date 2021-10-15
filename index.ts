import express, { Request, Response, NextFunction } from "express";

// routes
import userRoute from "./routes/user.route";

const app = express();
const port = 6969;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log(req.ip);
  res.send("Hello from express");
});

app.listen(port, () => {
  console.log(`App is listened on port ${port}`);
});
