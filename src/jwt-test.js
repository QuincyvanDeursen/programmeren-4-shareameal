const jwt = require("jsonwebtoken");
const privateKey = "secretstring";
jwt.sign({ foo: "bar" }, privateKey, function (err, token) {
  if (err) console.log(err);
  if (token) console.log(token);
});
