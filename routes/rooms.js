var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var RoomService = require("../services/RoomService")
var db = require("../models");
var roomService = new RoomService(db);
var { checkIfAuthorized } = require("./authMiddlewares")
var cache = require('../middleware/caching.js'); // ✅ Add caching middleware
var client = require('../redis.js');

/* GET rooms listing. */
router.get('/:hotelId', cache, async function(req, res, next) {
  try {
      const rooms = await roomService.getHotelRooms(req.params.hotelId);
      await client.set(req.originalUrl, JSON.stringify(rooms)); // ✅ Cache response
      const username = req.user?.username || "Guest"; // ✅ Ensure username is passed
      res.render('rooms', { rooms, user: req.user, username });
  } catch (error) {
      console.error("Error fetching hotel rooms:", error);
      res.status(500).send("Internal Server Error");
  }
});


router.get('/', cache, async function(req, res, next) {
  try {
      const rooms = await roomService.get();
      await client.set(req.originalUrl, JSON.stringify(rooms)); // ✅ Store response in Redis
      const username = req.user?.username || "Guest"; // ✅ Ensure username is passed
      res.render('rooms', { rooms, user: req.user, username });
  } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.post('/', checkIfAuthorized, jsonParser, async function(req, res, next) {
  try {
      let { Capacity, PricePerDay, HotelId } = req.body;
      const result = await roomService.create(Capacity, PricePerDay, HotelId);

      if (!result) { 
          return res.status(400).send({ message: "Failed to create room" });
      }

      await client.del('/rooms'); // ✅ Clear cached rooms list after update
      res.status(201).send({ message: "Room created successfully" });
  } catch (error) {
      console.error("Error creating a room:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.post('/reservation', checkIfAuthorized, jsonParser, async function(req, res, next) {
  try {
      let { UserId, RoomId, StartDate, EndDate } = req.body;
      const result = await roomService.rentARoom(UserId, RoomId, StartDate, EndDate);

      if (!result) { 
          return res.status(400).send({ message: "Failed to rent room" });
      }

      await client.del(`/rooms/${RoomId}`); // ✅ Clear specific room cache after update
      res.status(201).send({ message: "Room reservation successful" });
  } catch (error) {
      console.error("Error renting a room:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.delete('/', checkIfAuthorized, jsonParser, async function(req, res, next) {
  try {
      let { id } = req.body;
      const result = await roomService.deleteRoom(id);

      if (!result) { 
          return res.status(404).send({ message: "Room not found" });
      }

      await client.del('/rooms'); // ✅ Clear cached rooms list after deletion
      res.status(200).send({ message: "Room deleted successfully" });
  } catch (error) {
      console.error("Error deleting a room:", error);
      res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
