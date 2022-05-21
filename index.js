const express = require("express");
const routerUser = require("./src/routes/user.routes");
const routerAuth = require("./src/routes/authentication.routes");
const routerMeal = require("./src/routes/meal.routes");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
app.use(express.json());

//this function shows which function is called.
app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use(routerUser);
app.use(routerAuth);
app.use(routerMeal);

//function to give an error when an end-point isnt found
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.use((err, req, res, next) => {
  console.log("Error: " + err.toString());
  res.status(400).json({
    status: 400,
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
