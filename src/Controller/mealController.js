const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const logger = require("../../src/config/config").logger;

let controller = {
  validateMeal: (req, res, next) => {
    logger.debug("mealController: validateMeal called.");
    let meal = req.body;
    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      imageUrl,
      maxAmountOfParticipants,
      price,
    } = meal;
    try {
      assert(typeof name === "string", "name must be of type string");
      assert(
        typeof description === "string",
        "description must be of type string"
      );
      assert(typeof isActive === "boolean", "isActive must be of type boolean");
      assert(typeof isVega === "boolean", "isVega must be of type boolean");
      assert(typeof isVegan === "boolean", "isVegan must be of type boolean");
      assert(
        typeof isToTakeHome === "boolean",
        "isToTakeHome must be of type boolean"
      );

      assert(typeof dateTime === "string", "dateTime must be of type string");

      assert(typeof imageUrl === "string", " imageUrl must be of type string");

      assert(
        typeof maxAmountOfParticipants === "number",
        "maxAmountOfParticipants must be of type number"
      );

      assert(typeof price === "number", "phoneNumber must be of type number");
      logger.debug("mealController: meal is valid.");
      next();
    } catch (err) {
      logger.debug("mealController: meal is not valid.");
      next(err);
    }
  },

  getAllMeals: (req, res, next) => {
    logger.debug("mealController: getAllMeals called.");
    let query = `SELECT * FROM meal`;
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

  //POST: Add an user
  addMeal: (req, res, next) => {
    logger.debug("mealController: addMeal called.");
    //format allergenes JSON to the right string for the query
    const allergenes = req.body.allergenes;
    let allergenesString = "";
    for (let index = 0; index < allergenes.length; index++) {
      allergenesString += allergenes[index] + ",";
    }
    if (allergenesString.equals !== "") {
      allergenesString = allergenesString.slice(0, -1);
    }
    let mealReq = req.body;
    let cookId = req.userId;
    let mealObject = { ...mealReq, cookId };
    mealObject.allergenes = allergenesString;
    logger.debug("mealController: addMeal -->  Altered mealReq.");
    logger.debug(mealObject);
    let values = Object.keys(mealObject).map(function (key) {
      return mealObject[key];
    });

    dbconnection.getConnection(function (err, connection) {
      //if not connected
      if (err) {
        next(err);
      }
      const query = `INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES (?)`;
      //Use Connection
      connection.query(query, [values], function (error, results, fields) {
        connection.release();
        // Handle error after the release.
        if (error) {
          next(error);
        }

        // succesfull query handlers
        if (results.affectedRows > 0) {
          let meal = { id: results.insertId, ...req.body };
          res.status(201).json({
            status: 201,
            result: meal,
          });
        } else {
          res.status(400).json({
            status: 400,
            message: `Meal can not be created`,
          });
        }
      });
    });
  },

  deleteMeal: (req, res, next) => {
    logger.debug("mealController: deleteMeal called.");
    let query = `DELETE FROM meal WHERE id = (?)`;
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }

      connection.query(
        "SELECT * FROM meal WHERE id = ?",
        [req.params.mealId],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) {
            next(error);
          }
          // succesfull query handlers
          if (results.length > 0 && results[0].cookId != req.userId) {
            return res.status(403).json({
              status: 403,
              message: `Meal doesn't exists, or not authorized to delete the meal.`,
            });
          } else {
            // Use the connection
            connection.query(
              query,
              [req.params.mealId],
              function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                  next(error);
                }
                if (results.affectedRows > 0) {
                  let meal = { id: results.insertId, ...req.body };
                  res.status(200).json({
                    status: 200,
                    result: `Meal with id ${req.params.mealId} succesfully deleted.`,
                  });
                } else {
                  res.status(404).json({
                    status: 404,
                    message: `Deleting meal with id ${req.params.mealId} failed. It does not exist.`,
                  });
                }
              }
            );
          }
        }
      );
    });
  },

  findMeal: (req, res, next) => {
    logger.debug("mealController: findMeal called.");
    let query = `SELECT * FROM meal WHERE id = (?)`;
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }

      // Use the connection
      connection.query(
        query,
        [req.params.mealId],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) {
            next(error);
          }
          if (results.length > 0) {
            let meal = { id: results.insertId, ...req.body };
            res.status(200).json({
              status: 200,
              result: results[0],
            });
          } else {
            res.status(404).json({
              status: 404,
              message: `Can not find meal with id ${req.params.mealId}.`,
            });
          }
        }
      );
    });
  },

  updateMeal: (req, res, next) => {
    logger.debug("mealController: updateMeal called.");
    //format allergenes JSON to the right string for the query
    const allergenes = req.body.allergenes;
    let allergenesString = "";
    for (let index = 0; index < allergenes.length; index++) {
      allergenesString += allergenes[index] + ",";
    }
    if (allergenesString !== "") {
      allergenesString = allergenesString.slice(0, -1);
    }

    let mealReq = req.body;
    mealReq.allergenes = allergenesString;
    logger.debug("mealController: updateMeal --> altered mealReq.");
    logger.debug(mealReq);
    dbconnection.getConnection(function (err, connection) {
      //not connected
      if (err) {
        next(err);
      }
      connection.query(
        "SELECT * FROM meal WHERE id = ?",
        [req.params.mealId],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) {
            next(error);
          }
          if (results.length === 0) {
            return res.status(404).json({
              status: 404,
              message: `Meal doesn't exist.`,
            });
          }
          // succesfull query handlers
          if (results[0].cookId != req.userId) {
            return res.status(403).json({
              status: 403,
              message: `Not authorized to update the meal.`,
            });
          } else {
            // Use the connection
            connection.query(
              "UPDATE meal SET ? WHERE id = ?",
              [mealReq, req.params.mealId],
              function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                  next(error);
                }

                // succesfull query handlers
                if (results.affectedRows > 0) {
                  let mealUpdated = req.body;
                  res.status(200).json({
                    status: 200,
                    result: { id: req.params.mealId, ...mealUpdated },
                  });
                }
              }
            );
          }
        }
      );
    });
  },
};

module.exports = controller;
