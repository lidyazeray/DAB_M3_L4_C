var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var HotelService = require("../services/HotelService");
var db = require("../models");
var hotelService = new HotelService(db);
var { checkIfAuthorized, isAdmin } = require("./authMiddlewares");
var cache = require('../middleware/caching.js');
var client = require('../redis.js');

/* ✅ GET hotels listing with caching */
router.get('/', cache, async function (req, res, next) {
  try {
    let hotels = await hotelService.get();
    console.log("DEBUG: Hotels Data from DB:", hotels); // ✅ Log hotels data

    // 🔹 Ensure hotels is always an array
    if (!Array.isArray(hotels)) {
      console.log("WARNING: `hotels` is NOT an array! Fixing...");
      hotels = []; // ✅ Prevent `.forEach` error
    }

    await client.set(req.originalUrl, JSON.stringify(hotels)); // ✅ Cache response

    const username = req.user?.username || "Guest"; // ✅ Ensure username is defined
    res.render('hotels', { hotels, user: req.user, username });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).send("Internal Server Error");
  }
});


/* ✅ GET hotel details */
router.get('/:hotelId', async function(req, res, next) {
  try {
    const userId = req.user?.id ?? 0;
    const username = req.user?.username || "Guest"; // ✅ Ensure username is defined
    const hotel = await hotelService.getHotelDetails(req.params.hotelId, userId);

    if (!hotel) {
      return res.status(404).send("Hotel not found.");
    }

    console.log("Hotel Data:", hotel);
    res.render('hotelDetails', { hotel, userId, user: req.user, username }); // ✅ Pass username
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ✅ POST rate for a hotel */
router.post('/:hotelId/rate', checkIfAuthorized, jsonParser, async function (req, res, next) {
  try {
    const { Value, UserId } = req.body;
    if (!Value || !UserId) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    await hotelService.makeARate(UserId, req.params.hotelId, Value);
    res.status(200).json({ message: "Rating submitted successfully." });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ✅ POST create a new hotel (admin only) */
router.post('/', checkIfAuthorized, isAdmin, jsonParser, async function (req, res, next) {
  try {
    const { Name, Location } = req.body;
    if (!Name || !Location) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    await hotelService.create(Name, Location);

    await client.del('/hotels'); // ✅ Clear cached hotels after adding new one
    res.status(201).json({ message: "Hotel created successfully." });
  } catch (error) {
    console.error("Error creating hotel:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ✅ DELETE a hotel by ID */
router.delete('/', checkIfAuthorized, jsonParser, async function (req, res, next) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing hotel ID." });
    }
    await hotelService.deleteHotel(id);

    await client.del('/hotels'); // ✅ Clear cached hotels after deletion
    res.status(200).json({ message: "Hotel deleted successfully." });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ✅ DELETE a hotel using URL parameter */
router.delete('/:id', checkIfAuthorized, jsonParser, async function (req, res, next) {
  try {
    const hotelId = req.params.id;
    if (!hotelId) {
      return res.status(400).json({ error: "Missing hotel ID." });
    }
    await hotelService.deleteHotel(hotelId);

    await client.del('/hotels'); // ✅ Clear cached hotels after deletion
    res.status(200).json({ message: "Hotel deleted successfully." });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
