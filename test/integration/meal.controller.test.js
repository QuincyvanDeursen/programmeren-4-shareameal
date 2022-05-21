const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { jwtSecretKey, logger } = require("../../src/config/config");

const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `street`, `city`, `isActive`, `password`, `emailAdress`,  `phoneNumber` ) VALUES" +
  '(1, "Quincy", "van Deursen", "Lisdodde", "Breda", true,  "Secret1!", "Quincyvandeursen@gmail.com", "0612345678"),' +
  '(2, "Jimmy", "van Deursen", "Lisdodde", "Breda", false,  "Secret1!", "JimmyvanDeursen@gmail.com", "0612345678");';

const INSERT_MEAL =
  "INSERT INTO meal (id, name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES" +
  '(1, "meal1", "meal1 description", true, true, true, true, "2022-05-21 07:11:46", "image_url_meal1", "gluten,noten,lactose", 6, 5.55, 1),' +
  '(2, "meal2", "meal2 description", true, true, true, true, "2022-05-21 07:11:46", "image_url_meal2", "gluten,noten,lactose", 6, 5.55, 2);';

const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_MEAL_PARTICIPANT_TABLE =
  "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_MEAL_PARTICIPANT_TABLE + CLEAR_USERS_TABLE;

chai.should();
chai.use(chaiHttp);

describe("meals", () => {
  describe("Testcases of UC-301, create a new meal, api/meal/ ", () => {
    beforeEach((done) => {
      console.log("beforeEach called");
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEAL,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            done();
          }
        );
      });
    });

    it("TC-301-1 required field is missing. error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          //name is missing
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          datetime: "2022-05-21 07:11:46",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
          cookId: 1,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("name must be of type string");
          done();
        });
    });

    it("TC-301-2 not logged in.", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .send({
          name: "AtestingMeal",
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21T07:11:46.701Z",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
          cookId: 1,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });

    it("TC-301-3 creating meal succesfull.", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          name: "AtestingMeal",
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21 07:11:46",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
          cookId: 1,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.should.be.a("object").that.contains({
            id: result.id,
            name: "AtestingMeal",
            description: "Dé pastaklassieker bij uitstek.",
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            dateTime: "2022-05-21 07:11:46",
            imageUrl:
              "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            allergenes: result.allergenes,
            maxAmountOfParticipants: 6,
            price: 6.75,
          });
          done();
        });
    });
  });

  describe("Testcases of UC-302, updating a  meal, api/meal/:mealId ", () => {
    beforeEach((done) => {
      console.log("beforeEach called");
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEAL,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            done();
          }
        );
      });
    });
    it("TC-302-1 required field is missing. error should be returned.", (done) => {
      chai
        .request(server)
        .put("/api/meal/1")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          //name is missing
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21T07:11:46.701Z",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("name must be of type string");
          done();
        });
    });

    it("TC-302-2 not logged in", (done) => {
      chai
        .request(server)
        .put("/api/meal/1")
        .send({
          name: "AnewMeal",
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21T07:11:46.701Z",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("TC-302-3 not the owner of the meal.", (done) => {
      chai
        .request(server)
        .put("/api/meal/1")
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          name: "AnewMeal",
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21T07:11:46.701Z",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be
            .a("string")
            .that.equals("Not authorized to update the meal.");
          done();
        });
    });
    it("TC-302-4 meal doesn't exist.", (done) => {
      chai
        .request(server)
        .put("/api/meal/9999999")
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          name: "AnewMeal",
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21T07:11:46.701Z",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("Meal doesn't exist.");
          done();
        });
    });
    it("TC-302-5 meal succesfully updated.", (done) => {
      chai
        .request(server)
        .put("/api/meal/2")
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          name: "anUpdatedName",
          description: "Dé pastaklassieker bij uitstek.",
          isActive: true,
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-21T07:11:46.701Z",
          imageUrl:
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
          allergenes: ["gluten", "lactose"],
          maxAmountOfParticipants: 6,
          price: 6.75,
        })
        .end((err, res) => {
          res.should.be.an("object");
          console.log(res.body);
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("object").that.contains({
            id: result.id,
            name: "anUpdatedName",
            description: "Dé pastaklassieker bij uitstek.",
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            dateTime: "2022-05-21T07:11:46.701Z",
            imageUrl:
              "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            allergenes: result.allergenes,
            maxAmountOfParticipants: 6,
            price: 6.75,
          });
          done();
        });
    });
  });

  describe("Testcases of UC-303, getting all meals, api/meal/ ", () => {
    beforeEach((done) => {
      console.log("beforeEach called");
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEAL,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            done();
          }
        );
      });
    });
    it("TC-303-1 get list of all meals.", (done) => {
      chai
        .request(server)
        .get("/api/meal")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          status.should.equals(200);
          result.should.be.an("array");
          done();
        });
    });
  });

  describe("Testcases of UC-304, get details of a meal, api/meal/mealId ", () => {
    beforeEach((done) => {
      console.log("beforeEach called");
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEAL,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            done();
          }
        );
      });
    });
    it("TC-304-1, Meal doesn't exist", (done) => {
      let id = 0;
      chai
        .request(server)
        .get(`/api/meal/${id}`)
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals(`Can not find meal with id ${id}.`);
          done();
        });
    });

    it("TC-304-2, Meal does exist", (done) => {
      let id = 1;
      chai
        .request(server)
        .get(`/api/meal/${id}`)
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("object").that.contains({
            id: 1,
            name: "meal1",
            description: "meal1 description",
            isActive: 1,
            isVega: 1,
            isVegan: 1,
            isToTakeHome: 1,
            dateTime: result.dateTime,
            imageUrl: "image_url_meal1",
            allergenes: result.allergenes,
            maxAmountOfParticipants: 6,
            price: result.price,
            cookId: 1,
          });
          done();
        });
    });
  });
  describe("Testcases of UC-305, deleting a meal, api/meal/mealId ", () => {
    beforeEach((done) => {
      console.log("beforeEach called");
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEAL,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            done();
          }
        );
      });
    });
    it("TC-305-2 not logged in.", (done) => {
      chai
        .request(server)
        .delete("/api/meal/1")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("TC-305-3 not the owner of the data.", (done) => {
      chai
        .request(server)
        .delete("/api/meal/1")
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be
            .a("string")
            .that.equals(
              "Meal doesn't exists, or not authorized to delete the meal."
            );
          done();
        });
    });
    it("TC-305-4 meal does not exist", (done) => {
      chai
        .request(server)
        .delete("/api/meal/0")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals("Deleting meal with id 0 failed. It does not exist.");
          done();
        });
    });

    it("TC-305-5 meal does not exist", (done) => {
      chai
        .request(server)
        .delete("/api/meal/2")
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be
            .a("string")
            .that.equals("Meal with id 2 succesfully deleted.");
          done();
        });
    });
  });
});
