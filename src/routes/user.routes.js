const express = require("express");
const { updateUser } = require("../Controller/userController");
const router = express.Router();
const userController = require("../Controller/userController");

//this function executes a GET call on the homepage.
router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Share a meal project, programmeren 4, Quincy van Deursen, 2113709",
  });
});

//this function executes a post call to create an user. The given email must be unique. The user is added to the database (array). UC-201.
router.post("/api/user", userController.addUser);

//function to update an existing user. Email cant be duplicated. UC-205
router.put("/api/user/:userId", userController.updateUser);

//function to get the profile. UC-203
router.get("/api/user/profile", userController.getProfile);

//function to find an user by id. UC-204
router.get("/api/user/:userId", userController.findUser);

//function to get all users in the database (array). UC-202
router.get("/api/user", userController.getAllUsers);

//function to delete a specific user.
router.delete("/api/user/:userId", userController.deleteUser);

module.exports = router;
