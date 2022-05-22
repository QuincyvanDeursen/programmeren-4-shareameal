const assert = require("assert");
const dbconnection = require("../../database/dbconnection");

let controller = {
  validatePhoneNumber: (req, res, next) => {
    // password must contain 1 upper and lowercase char, 1 number, and atleast 8 chars.
    console.log(req.body);
    const phoneNumber = new RegExp(
      /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
    );
    try {
      assert(
        phoneNumber.test(req.body.phoneNumber) === true,
        "Phonenumber isn't valid."
      );
      next();
    } catch (err) {
      console.log("validatePhoneNumber: " + err);
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
    try {
      assert(
        passwordRegex.test(req.body.password) === true,
        "Password isn't valid (must contain 1 uppercase letter, 1 number, and be atleast 8 characters long."
      );
      console.log("validatePassword: Called");
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

  validateEmail: (req, res, next) => {
    //email regex
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    let user = req.body;
    let emailAdress = user.emailAdress;
    try {
      assert(emailRegex.test(emailAdress) === true, "Emailaddress isn't valid");
    } catch (err) {
      console.log(err);
      error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }

    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }

      connection.query(
        `SELECT * FROM user WHERE emailAdress = '${req.body.emailAdress}'`,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // handle error after release.
          if (error) {
            next(error);
          }
          if (results.length == 0 || results[0].id == req.params.userId) {
            next();
          } else {
            return res.status(409).json({
              status: 409,
              message: `Creating user failed. There already is an user with the email '${req.body.emailAdress}'.`,
            });
          }
        }
      );
    });
  },

  //validate the data types of the given user.
  validateUser: (req, res, next) => {
    let user = req.body;
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
      password,
      emailAdress,
      phoneNumber,
    } = user;
    console.log(user);
    try {
      assert(typeof firstName === "string", "firstname must be of type string");
      assert(typeof lastName === "string", "lastname must be of type string");

      assert(
        typeof emailAdress === "string",
        "emailaddress must be of type string"
      );

      assert(typeof city === "string", "city must be of type string");

      assert(typeof street === "string", " street must be of type string");

      assert(typeof isActive === "boolean", "isActive must be of type boolean");

      assert(typeof password === "string", "Password must be of type string");

      assert(
        typeof phoneNumber === "string",
        "phoneNumber must be of type string"
      );

      next();
    } catch (err) {
      next(err);
    }
  },

  //POST: Add an user
  addUser: (req, res, next) => {
    let userReq = req.body;
    let values = Object.keys(userReq).map(function (key) {
      return userReq[key];
    });

    dbconnection.getConnection(function (err, connection) {
      //if not connected
      if (err) {
        next(err);
      }
      //Use Connection
      connection.query(
        `INSERT INTO user (firstName, lastName, street, city, isActive, password, emailAdress, phoneNumber) VALUES (?)`,
        [values],
        function (error, results, fields) {
          connection.release();
          // Handle error after the release.
          if (error) {
            next(error);
          }

          // succesfull query handlers
          if (results.affectedRows > 0) {
            let person = { id: results.insertId, ...req.body };
            res.status(201).json({
              status: 201,
              result: person,
            });
          } else {
            res.status(400).json({
              status: 400,
              message: `User can not be created`,
            });
          }
        }
      );
    });
  },

  //update an user
  updateUser(req, res, next) {
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }
      if (req.params.userId != req.userId) {
        return res.status(400).json({
          status: 400,
          message: `User doesn't exists, or not authorized to update the user.`,
        });
      } else {
        // Use the connection
        connection.query(
          "UPDATE user SET ? WHERE id = ?",
          [req.body, req.params.userId],
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();
            // Handle error after the release.
            if (error) {
              next(error);
            }

            // succesfull query handlers
            if (results.affectedRows > 0) {
              userToUpdate = req.body;
              res.status(200).json({
                status: 200,
                result: { id: req.params.userId, ...userToUpdate },
              });
            } else {
              res.status(400).json({
                status: 400,
                message: `Can't find user with ID: ${req.params.userId}`,
              });
            }
          }
        );
      }
    });
  },

  // get the profile of an user
  getProfile: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }
      connection.query(
        `SELECT * FROM user WHERE id = ${req.userId}`,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // handle error after release.
          if (error) {
            next(error);
          }

          if (results.length > 0) {
            return res.status(200).json({
              status: 200,
              result: results[0],
            });
          } else {
            return res.status(401).json({
              status: 401,
              message: `Can not retrieve profile. Unknown error.`,
            });
          }
        }
      );
    });
  },

  //find an user by id
  findUser: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }
      connection.query(
        `SELECT * FROM user WHERE id = ${req.params.userId}`,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // handle error after release.
          if (error) {
            next(error);
          }
          if (results.length > 0) {
            return res.status(200).json({
              status: 200,
              result: results,
            });
          } else {
            return res.status(404).json({
              status: 404,
              message: `Can not find user with ID ${req.params.userId}`,
            });
          }
        }
      );
    });
  },

  //Retrieve all users
  getAllUsers: (req, res, next) => {
    let query = `SELECT * FROM user`;
    const { length, isActive, firstName } = req.query;
    console.log(
      `GetAllUsers params: length = ${length}, isActive = ${isActive}, firstName = ${firstName}`
    );
    if (isActive && firstName) {
      query += ` WHERE firstName = '${firstName}' AND isActive = ${isActive}`;
    } else if (isActive) {
      query += ` WHERE isActive = ${isActive}`;
    } else if (firstName) {
      query += ` WHERE firstName = '${firstName}'`;
    }
    if (length) {
      query += ` LIMIT ${length}`;
    }

    console.log("getAllUsers Query:" + query);

    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }

      // Use the connection
      connection.query(query, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) {
          next(error);
        }
        res.status(200).json({
          status: 200,
          result: results,
        });
      });
    });
  },

  //Delete user
  deleteUser: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }

      //Check if the person is deleting his own account, if not return error 401.
      if (req.params.userId != req.userId) {
        if (req.params.userId > 1000000 || !Number(req.params.userId)) {
          return res.status(400).json({
            status: 400,
            message: `User doesn't exists.`,
          });
        }
        return res.status(403).json({
          status: 403,
          message: `Not authorized to delete the user.`,
        });
      }

      // Use the connection
      connection.query(
        `DELETE FROM user WHERE ID = ${req.params.userId}`,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) {
            next(error);
          }

          if (results.affectedRows > 0) {
            res.status(200).json({
              status: 200,
              result: `User with id ${req.params.userId} succesfully deleted.`,
            });
          } else {
            res.status(400).json({
              status: 400,
              message: `User with id ${req.params.userId} not found.`,
            });
          }
        }
      );
    });
  },
};

module.exports = controller;
