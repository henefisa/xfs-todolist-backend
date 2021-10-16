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
    await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: "123123",
      })
      .then((response) => {
        expect(response.body.status).toBe("okay");
        expect(response.body.elements.username).toBe("sample");
        expect(typeof response.body.elements.password).toBe("string");
      });
  });

  test("create same user", async () => {
    await supertest(app)
      .post("/user/register")
      .send({ username: "sample", password: "password" });

    await supertest(app)
      .post("/user/register")
      .send({
        username: "sample",
        password: "123123",
      })
      .then((response) => {
        expect(response.body.status).toBe(409);
        expect(response.body.message).toBe(`Username sample is already used!`);
      });
  });

  test("create user without username", async () => {
    await supertest(app)
      .post("/user/register")
      .send({ password: "sample" })
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe(`"username" is required`);
      });
  });

  test("create user without password", async () => {
    await supertest(app)
      .post("/user/register")
      .send({ username: "sample" })
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe(`"password" is required`);
      });
  });

  test("create user with password length is 2", async () => {
    await supertest(app)
      .post("/user/register")
      .send({ username: "sample", password: "12" })
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe(
          `"password" length must be at least 4 characters long`
        );
      });
  });

  test("create user with password length is 33", async () => {
    await supertest(app)
      .post("/user/register")
      .send({
        username: "sample",
        password: new Array(33).fill(~~Math.random()).join(""),
      })
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe(
          `"password" length must be less than or equal to 32 characters long`
        );
      });
  });

  test("create user with password length is between 4 and 32", async () => {
    await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: new Array(~~(Math.random() * (32 - 4 + 1) + 4))
          .fill(~~Math.random())
          .join(""),
      })
      .then((response) => {
        expect(response.body.status).toBe("okay");
        expect(response.body.elements.username).toBe("sample");
        expect(typeof response.body.elements.password).toBe("string");
      });
  });
});

describe("POST /user/login", () => {
  test("login user", async () => {
    await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: "sample",
      })
      .then((response) => {
        expect(response.body.status).toBe("okay");
        expect(response.body.elements.username).toBe("sample");
        expect(typeof response.body.elements.password).toBe("string");
      });

    await supertest(app)
      .post("/user/login")
      .send({
        username: "Sample",
        password: "sample",
      })
      .then((response) => {
        expect(typeof response.body.accessToken).toBe("string");
      });
  });

  test("login user without username", async () => {
    await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: "sample",
      })
      .then((response) => {
        expect(response.body.status).toBe("okay");
        expect(response.body.elements.username).toBe("sample");
        expect(typeof response.body.elements.password).toBe("string");
      });

    await supertest(app)
      .post("/user/login")
      .send({
        password: "sample",
      })
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe('"username" is required');
      });
  });

  test("login user without password", async () => {
    await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: "sample",
      })
      .then((response) => {
        expect(response.body.status).toBe("okay");
        expect(response.body.elements.username).toBe("sample");
        expect(typeof response.body.elements.password).toBe("string");
      });

    await supertest(app)
      .post("/user/login")
      .send({
        username: "sample",
      })
      .then((response) => {
        expect(response.body.status).toBe(500);
        expect(response.body.message).toBe('"password" is required');
      });
  });

  test("login user with wrong password", async () => {
    await supertest(app)
      .post("/user/register")
      .send({
        username: "Sample",
        password: "sample",
      })
      .then((response) => {
        expect(response.body.status).toBe("okay");
        expect(response.body.elements.username).toBe("sample");
        expect(typeof response.body.elements.password).toBe("string");
      });

    await supertest(app)
      .post("/user/login")
      .send({
        username: "sample",
        password: "wrongpassword",
      })
      .then((response) => {
        console.log(response.body);
        expect(response.body.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized");
      });
  });
});
