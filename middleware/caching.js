var client = require('../redis.js');

async function cache(req, res, next) {
  try {
    const data = await client.get(req.originalUrl);
    if (data !== null) {
      const hotels = JSON.parse(data);
      const username = req.user?.username || "Guest"; // ✅ Ensure username is defined
      res.render('hotels', { hotels, user: req.user, username }); // ✅ Pass username
    } else {
      next();
    }
  } catch (error) {
    console.error("Redis Cache Error:", error);
    next(); // ✅ Continue even if Redis fails
  }
}

module.exports = cache;
