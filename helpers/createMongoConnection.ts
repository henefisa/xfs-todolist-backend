import mongoose from "mongoose";

const createMongoConnection = (uri: string) => {
  const connection = mongoose.createConnection(uri);

  connection.on("connected", () => {
    console.log("Mongodb connected");
  });

  connection.on("disconnected", () => {
    console.log("Mongodb disconnected");
  });

  connection.on("error", (error) => {
    console.log(error);
  });

  return connection;
};

export default createMongoConnection;
