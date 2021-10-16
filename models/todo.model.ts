import mongoose, { Schema } from "mongoose";

export interface ITodo {
  content: string;
  status: boolean;
  date: Date;
  priority: number;
  userId: string;
}

const TodoSchema: Schema<ITodo> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  priority: {
    type: Number,
    default: 0,
  },
  userId: {
    type: String,
  },
});

export { TodoSchema };
export default mongoose.model("todos", TodoSchema);
