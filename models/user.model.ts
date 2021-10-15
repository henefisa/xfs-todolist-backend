import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import createConnection from "../helpers/createConnection";

const UsersConnection = createConnection(`mongodb://localhost:27017/users`);

interface IUser {
  username: string;
  password: string;
}

interface IUserDocument extends IUser, Document {
  checkPassword: (password: string) => Promise<void>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre<IUser>("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
  next();
});

UserSchema.methods.checkPassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {}
};

export default UsersConnection.model<IUserDocument>("users", UserSchema);
