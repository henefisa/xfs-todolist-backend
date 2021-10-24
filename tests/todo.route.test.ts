import mongoose from "mongoose";
import supertest from "supertest";
import app from "../index";
import { isRegistered, isLoggedIn } from "./customMatchers";

beforeEach((done) => {
  mongoose.connect(`mongodb://mongodb:27017/jestDb`, () => {
    done();
  });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

expect.extend({
  isRegistered,
  isLoggedIn,
});

describe("POST /todo/add", () => {
  test("create todo", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse).isRegistered("sample");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });

    expect(loginResponse).isLoggedIn();

    const createTodoResponse = await supertest(app)
      .post("/todo/add")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: "Sample content",
      });

    expect(createTodoResponse.status).toBe(201);
    expect(createTodoResponse.body.status).toBe(false);
    expect(createTodoResponse.body.priority).toBe(0);
  });

  test("create todo without access token", async () => {
    const createTodoResponse = await supertest(app).post("/todo/add").send({
      content: "Sample content",
    });

    expect(createTodoResponse.status).toBe(401);
    expect(createTodoResponse.body.message).toBe("Unauthorized");
  });

  test("create todo without content", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse).isRegistered("sample");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });

    expect(loginResponse).isLoggedIn();

    const createTodoResponse = await supertest(app)
      .post("/todo/add")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .send({});

    expect(createTodoResponse.status).toBe(400);
    expect(createTodoResponse.body.message).toBe(`"content" is required`);
  });
});
