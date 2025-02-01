var express = require('express');
var router = express.Router();
var db = require("../models");
var UserService = require("../services/UserService")
var userService = new UserService(db);
var { canSeeUserList, canSeeUserDetails, checkIfAuthorized, isAdmin } = require("./authMiddlewares")
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var cache = require('../middleware/caching.js');
var client = require('../redis.js');

/* GET users listing. */
router.get('/', canSeeUserList, cache, async function(req, res, next) {
  try {
      const users = await userService.getAll();
      await client.set(req.originalUrl, JSON.stringify(users)); // ✅ Cache response
      res.render('users', { users, user: req.user });
  } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get('/:userId', canSeeUserDetails, cache, async function(req, res, next) {
  try {
      const user = await userService.getOne(req.params.userId);
      await client.set(req.originalUrl, JSON.stringify(user)); // ✅ Cache response
      res.render('userDetails', { user, user: req.user });
  } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.delete('/', checkIfAuthorized, isAdmin, jsonParser, async function(req, res, next) {
  try {
      let id = req.body.id;
      await userService.deleteUser(id);

      // ✅ Remove cached users list from Redis since the data has changed
      await client.del('/users');

      res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
