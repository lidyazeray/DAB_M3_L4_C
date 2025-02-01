var express = require('express');
var router = express.Router();
var cache = require('../middleware/caching.js'); // ✅ Include caching middleware
var client = require('../redis.js');

/* GET home page with caching */
router.get('/', cache, async function (req, res, next) {
  try {
      const title = 'Hotel Booking';

      // Store in Redis cache with expiration (60s)
      await client.set(req.originalUrl, JSON.stringify({ title }), { EX: 60 });

      res.render('index', { title });
  } catch (error) {
      console.error("Error rendering homepage:", error);
      res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
