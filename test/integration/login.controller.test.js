const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { jwtSecretKey, logger } = require("../../src/config/config");
const { expect } = require("chai");

const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `street`, `city`, `isActive`, `password`, `emailAdress`,  `phoneNumber` ) VALUES" +
  '(1, "Quincy", "van Deursen", "Lisdodde", "Breda", true,  "Secret1997", "Quincyvandeursen@gmail.com", "0612345678"),' +
  '(2, "Jimmy", "van Deursen", "Lisdodde", "Breda", false,  "Secret1997", "JimmyvanDeursen@gmail.com", "0612345678");';
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_MEAL_PARTICIPANT_TABLE =
  "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_MEAL_PARTICIPANT_TABLE + CLEAR_USERS_TABLE;

chai.should();
chai.use(chaiHttp);
// all tests below belong to the route api/user/
describe("Login", () => {
  describe("Testcases of UC-101, login /api/auth/login/ ", () => {
    beforeEach((done) => {
      console.log("beforeEach called");
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER,
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

    it("TC-101-1 required field is missing. error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Quincyvandeursen@gmail.com",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("password must be a string.");
          done();
        });
    });

    it("TC-101-2 Invalid email. error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Quincyvandeursengmail.com",
          password: "Secret1997",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Emailaddress isn't valid");
          done();
        });
    });

    it("TC-101-3 Invalid password. error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Quincyvandeursen@gmail.com",
          password: "Secret",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals(
              "Password isn't valid (must contain 1 uppercase letter, 1 number, and be atleast 8 characters long."
            );
          done();
        });
    });

    it("TC-101-4 user does not exist", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Anonexistinguser@gmail.com",
          password: "Secret1997",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          done();
        });
    });
    it("TC-101-5 user does exist", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Quincyvandeursen@gmail.com",
          password: "Secret1997",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("object").that.contains({
            id: result.id,
            emailAdress: "Quincyvandeursen@gmail.com",
            firstName: "Quincy",
            lastName: "van Deursen",
            token: result.token,
          });
          done();
        });
    });
  });
});
