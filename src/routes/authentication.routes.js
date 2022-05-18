const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController.js");

//this function executes a post call to create an user. The given email must be unique. The user is added to the database (array). UC-201.
router.post(
  "/api/auth/login",
  authController.validateLogin,
  authController.validateEmail,
  authController.validatePassword,
  authController.login
);

module.exports = router;
