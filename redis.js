const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true, // ✅ Ensure TLS is enabled for secure Redis connection
    },
});

redisClient.on("error", (err) => console.error("❌ Redis Connection Error:", err));

redisClient.connect()
    .then(() => console.log("✅ Connected to Redis!"))
    .catch(console.error);

module.exports = redisClient;
