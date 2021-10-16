import User from "../models/user.model";
import mongoose from "mongoose";
import supertest from "supertest";
import app, { server } from "../index";

beforeEach((done) => {
  mongoose.connect(`mongodb://localhost:27017/users`, () => {
    done();
  });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
  server.close();
});

describe("POST /user/register", () => {
  test("create user", async () => {
    const response = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "123123",
    });

    expect(response.body.status).toBe("okay");
    expect(response.body.elements.username).toBe("sample");
    expect(typeof response.body.elements.password).toBe("string");
  });

  test("create same user", async () => {
    await supertest(app)
      .post("/user/register")
      .send({ username: "sample", password: "password" });

    const response = await supertest(app).post("/user/register").send({
      username: "sample",
      password: "123123",
    });

    expect(response.body.status).toBe(409);
    expect(response.body.message).toBe(`Username sample is already used!`);
  });

  test("create user without username", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({ password: "sample" });

    expect(response.body.status).toBe(500);
    expect(response.body.message).toBe(`"username" is required`);
  });

  test("create user without password", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({ username: "sample" });

    expect(response.body.status).toBe(500);
    expect(response.body.message).toBe(`"password" is required`);
  });

  test("create user with password length is 2", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({ username: "sample", password: "12" });
    expect(response.body.status).toBe(500);
    expect(response.body.message).toBe(
      `"password" length must be at least 4 characters long`
    );
  });

  test("create user with password length is 33", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({
        username: "sample",
        password: new Array(33).fill(~~Math.random()).join(""),
      });

    expect(response.body.status).toBe(500);
    expect(response.body.message).toBe(
      `"password" length must be less than or equal to 32 characters long`
    );
  });

  test("create user with password length is between 4 and 32", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: new Array(~~(Math.random() * (32 - 4 + 1) + 4))
          .fill(~~Math.random())
          .join(""),
      });

    expect(response.body.status).toBe("okay");
    expect(response.body.elements.username).toBe("sample");
    expect(typeof response.body.elements.password).toBe("string");
  });
});

describe("POST /user/login", () => {
  test("login user", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });
    expect(registerResponse.body.status).toBe("okay");
    expect(registerResponse.body.elements.username).toBe("sample");
    expect(typeof registerResponse.body.elements.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });

    expect(typeof loginResponse.body.accessToken).toBe("string");
    expect(typeof loginResponse.body.refreshToken).toBe("string");
  });

  test("login uncreated user", async () => {
    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });
    expect(loginResponse.body.status).toBe(404);
    expect(loginResponse.body.message).toBe("User not registered");
  });

  test("login user without username", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse.body.status).toBe("okay");
    expect(registerResponse.body.elements.username).toBe("sample");
    expect(typeof registerResponse.body.elements.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      password: "sample",
    });

    expect(loginResponse.body.status).toBe(500);
    expect(loginResponse.body.message).toBe('"username" is required');
  });

  test("login user without password", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse.body.status).toBe("okay");
    expect(registerResponse.body.elements.username).toBe("sample");
    expect(typeof registerResponse.body.elements.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "sample",
    });

    expect(loginResponse.body.status).toBe(500);
    expect(loginResponse.body.message).toBe('"password" is required');
  });

  test("login user with wrong password", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse.body.status).toBe("okay");
    expect(registerResponse.body.elements.username).toBe("sample");
    expect(typeof registerResponse.body.elements.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "sample",
      password: "wrongpassword",
    });
    expect(loginResponse.body.status).toBe(401);
    expect(loginResponse.body.message).toBe("Unauthorized");
  });
});

describe("GET random route", () => {
  test("get random", async () => {
    await supertest(app)
      .get("/this/is/random")
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe("Not Found!");
      });
  });
});