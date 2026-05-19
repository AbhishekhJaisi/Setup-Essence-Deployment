require('dotenv').config();
const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        rejectUnauthorized: false  // required for cloud Redis providers
    }
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
    console.log("Redis error:", err);
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();

        const pong = await redisClient.ping();
        console.log("Redis PING:", pong);
    }
};

module.exports = { redisClient, connectRedis };