import redis from "redis";

const client = redis.createClient({
  port: 6379,
  host: "redis",
});

client.ping((_, reply) => {
  console.log(reply);
});

client.on("ready", () => {
  console.log("Redis is ready");
});

client.on("error", (error) => {
  console.error(error);
});

client.on("connect", () => {
  console.log("Redis connected");
});

export default client;
