import mongoose from "mongoose";
import supertest from "supertest";
import app from "../index";

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

describe("POST /user/register", () => {
  test("create user", async () => {
    const response = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "123123",
    });

    expect(response.status).toBe(201);
    expect(response.body.username).toBe("sample");
    expect(typeof response.body.password).toBe("string");
  });

  test("create same user", async () => {
    await supertest(app)
      .post("/user/register")
      .send({ username: "sample", password: "password" });

    const response = await supertest(app).post("/user/register").send({
      username: "sample",
      password: "123123",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(`Username sample is already used!`);
  });

  test("create user without username", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({ password: "sample" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(`"username" is required`);
  });

  test("create user without password", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({ username: "sample" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(`"password" is required`);
  });

  test("create user with password length is 2", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({ username: "sample", password: "12" });
    expect(response.status).toBe(400);
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

    expect(response.status).toBe(400);
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

    expect(response.status).toBe(201);
    expect(response.body.username).toBe("sample");
    expect(typeof response.body.password).toBe("string");
  });
});

describe("POST /user/login", () => {
  test("login user", async () => {
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
  });

  test("login uncreated user", async () => {
    const loginResponse = await supertest(app).post("/user/login").send({
      username: "Sample",
      password: "sample",
    });
    expect(loginResponse.status).toBe(404);
    expect(loginResponse.body.message).toBe("User not registered");
  });

  test("login user without username", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.username).toBe("sample");
    expect(typeof registerResponse.body.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      password: "sample",
    });

    expect(loginResponse.status).toBe(400);
    expect(loginResponse.body.message).toBe('"username" is required');
  });

  test("login user without password", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.username).toBe("sample");
    expect(typeof registerResponse.body.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "sample",
    });

    expect(loginResponse.status).toBe(400);
    expect(loginResponse.body.message).toBe('"password" is required');
  });

  test("login user with wrong password", async () => {
    const registerResponse = await supertest(app).post("/user/register").send({
      username: "Sample",
      password: "sample",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.username).toBe("sample");
    expect(typeof registerResponse.body.password).toBe("string");

    const loginResponse = await supertest(app).post("/user/login").send({
      username: "sample",
      password: "wrongpassword",
    });
    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.message).toBe("Unauthorized");
  });
});

describe("POST /user/refresh-token", () => {
  test("send user refresh token", async () => {
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

    const refreshTokenResponse = await supertest(app)
      .post("/user/refresh-token")
      .send({
        refreshToken: loginResponse.body.refreshToken,
      });

    expect(typeof refreshTokenResponse.body.accessToken).toBe("string");
    expect(typeof refreshTokenResponse.body.refreshToken).toBe("string");
  });

  test("without refresh token", async () => {
    const refreshTokenResponse = await supertest(app)
      .post("/user/refresh-token")
      .send({});
    expect(refreshTokenResponse.status).toBe(400);
    expect(refreshTokenResponse.body.message).toBe("Bad Request");
  });

  test("using random access token", async () => {
    const refreshTokenResponse = await supertest(app)
      .post("/user/refresh-token")
      .send({
        refreshToken: "This is random refresh token",
      });

    expect(refreshTokenResponse.status).toBe(401);
    expect(refreshTokenResponse.body.message).toBe("jwt malformed");
  });
});

describe("DELETE /user/logout", () => {
  test("logout user", async () => {
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

    const logoutResponse = await supertest(app).delete("/user/logout").send({
      refreshToken: loginResponse.body.refreshToken,
    });
    expect(logoutResponse.status).toBe(204);
  });

  test("logout without refresh token", async () => {
    const logoutResponse = await supertest(app).delete("/user/logout").send({});
    expect(logoutResponse.status).toBe(400);
    expect(logoutResponse.body.message).toBe("Bad Request");
  });

  test("logout with random access token", async () => {
    const refreshTokenResponse = await supertest(app)
      .post("/user/refresh-token")
      .send({
        refreshToken: "This is random refresh token",
      });

    expect(refreshTokenResponse.status).toBe(401);
    expect(refreshTokenResponse.body.message).toBe("jwt malformed");
  });
});

describe("GET random route", () => {
  test("get random", async () => {
    const response = await supertest(app).get("/this/is/random");
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Not Found!");
  });
});
