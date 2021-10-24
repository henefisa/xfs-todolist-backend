import { Response } from "supertest";
const isRegistered = (received: Response, username: string) => {
  let pass = true;
  let message = ``;

  if (received.status !== 201) {
    pass = false;
    message += `Status should be 201\n`;
  }

  if (received.body.username !== username) {
    pass = false;
    message += `Username ${received.body.username} should be ${username}\n`;
  }

  if (typeof received.body.password !== "string") {
    pass = false;
    message += `Type of password should be string\n`;
  }

  return {
    pass,
    message: () => message,
  };
};

const isLoggedIn = (received: Response) => {
  let pass = true;
  let message = ``;

  if (received.status !== 200) {
    pass = false;
    message += `Status should be 200\n`;
  }

  if (typeof received.body.accessToken !== "string") {
    pass = false;
    message += `Type of access token should be string\n`;
  }

  if (typeof received.body.refreshToken !== "string") {
    pass = false;
    message += `Type of refresh token should be string\n`;
  }

  return {
    pass,
    message: () => message,
  };
};

export { isRegistered, isLoggedIn };
