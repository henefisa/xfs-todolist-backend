import JWT from "jsonwebtoken";

const signAccessToken = async (userId: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };

    const SECRET = "SECRET";
    const options = {
      expiresIn: "1h",
    };

    JWT.sign(payload, SECRET, options, (error, token) => {
      if (error) {
        reject(error);
      }
      resolve(token);
    });
  });
};

export { signAccessToken };
