const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbconnection");
const logger = require("../config/config").logger;
const jwtSecretKey = require("../config/config").jwtSecretKey;

module.exports = {
  validateEmail: (req, res, next) => {
    //email regex
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    let user = req.body;
    let emailAdress = user.emailAdress;
    try {
      assert(emailRegex.test(emailAdress) === true, "Emailaddress isn't valid");
      next();
    } catch (err) {
      console.log(err);
      error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  validatePassword: (req, res, next) => {
    // password must contain 1 upper and lowercase char, 1 number, and atleast 8 chars.
    const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/);
    console.log("validatePassword: Called");
    try {
      assert(
        passwordRegex.test(req.body.password) === true,
        "Password isn't valid (must contain 1 uppercase letter, 1 number, and be atleast 8 characters long."
      );

      next();
    } catch (err) {
      console.log("ValidatePassword: " + err);
      error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  login(req, res, next) {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        logger.error("Error getting connection from dbconnection");
        res.status(500).json({
          error: err.toString(),
          datetime: new Date().toISOString(),
        });
      }
      if (connection) {
        // 1. Kijk of deze useraccount bestaat.
        connection.query(
          "SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?",
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release();
            if (err) {
              logger.error("Error: ", err.toString());
              res.status(500).json({
                error: err.toString(),
                datetime: new Date().toISOString(),
              });
            }
            if (rows) {
              // 2. Er was een resultaat, check het password.
              if (
                rows &&
                rows.length === 1 &&
                rows[0].password == req.body.password
              ) {
                logger.info(
                  "passwords DID match, sending userinfo and valid token"
                );
                // Extract the password from the userdata - we do not send that in the response.
                const { password, ...userinfo } = rows[0];
                // Create an object containing the data we want in the payload.
                const payload = {
                  userId: userinfo.id,
                };

                jwt.sign(
                  payload,
                  jwtSecretKey,
                  { expiresIn: "12d" },
                  function (err, token) {
                    logger.debug("User logged in, sending: ", userinfo);
                    res.status(200).json({
                      status: 200,
                      result: { ...userinfo, token },
                    });
                  }
                );
              } else {
                logger.info("User not found or password invalid");
                res.status(404).json({
                  status: 404,
                  message: "User not found or password invalid",
                  datetime: new Date().toISOString(),
                });
              }
            }
          }
        );
      }
    });
  },

  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
      assert(
        typeof req.body.emailAdress === "string",
        "email must be a string."
      );
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );
      next();
    } catch (err) {
      next(err);
    }
  },

  validateToken(req, res, next) {
    logger.info("validateToken called");
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    if (req) {
      console.log("req is aanwezig");
    } else {
      console.log("req is leeg");
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Authorization header missing!");
      res.status(401).json({
        status: 401,
        message: "Authorization header missing!",
        datetime: new Date().toISOString(),
      });
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn("Not authorized");
          res.status(401).json({
            status: 401,
            message: "Not authorized",
            datetime: new Date().toISOString(),
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.userId;
          next();
        }
      });
    }
  },
};
