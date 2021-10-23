import mongoose from "mongoose";
import supertest from "supertest";
import app from "../index";

beforeEach((done) => {
  mongoose.connect(`mongodb://localhost:27017/jestDb`, () => {
    done();
  });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("POST /todo/add", () => {
  test("create todo", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.username).toBe("sample");
    expect(typeof registerResponse.body.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });
    expect(loginResponse.status).toBe(200);
    expect(typeof loginResponse.body.accessToken).toBe("string");
    expect(typeof loginResponse.body.refreshToken).toBe("string");

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
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.username).toBe("sample");
    expect(typeof registerResponse.body.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });

    expect(typeof loginResponse.body.accessToken).toBe("string");
    expect(typeof loginResponse.body.refreshToken).toBe("string");

    const createTodoResponse = await supertest(app)
      .post("/todo/add")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .send({});

    expect(createTodoResponse.status).toBe(400);
    expect(createTodoResponse.body.message).toBe(`"content" is required`);
  });
});
