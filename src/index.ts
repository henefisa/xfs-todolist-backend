import express, { Request, Response, NextFunction } from "express";

const app = express();
const port = 6969;

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log(req.ip);
  res.send("Hello from express");
});

app.listen(port, () => {
  console.log(`App is listened on port ${port}`);
});
