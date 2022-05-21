const express = require("express");
const router = express.Router();
const mealController = require("../Controller/mealController");
const authController = require("../Controller/authController");

router.post(
  "/api/meal",
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);
router.get("/api/meal", mealController.getAllMeals);
router.get("/api/meal/:mealId", mealController.findMeal);
router.put(
  "/api/meal/:mealId",
  authController.validateToken,
  mealController.validateMeal,
  mealController.updateMeal
);
router.delete(
  "/api/meal/:mealId",
  authController.validateToken,
  mealController.deleteMeal
);

module.exports = router;
