const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());
const routerUser = require("./src/routes/user.routes");

//this function shows which function is called.
app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use(routerUser);

//function to give an error when an end-point isnt found
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
