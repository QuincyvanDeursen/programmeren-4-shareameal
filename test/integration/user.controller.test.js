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
  '(1, "Quincy", "van Deursen", "Lisdodde", "Breda", true,  "Secret1!", "Quincyvandeursen@gmail.com", "0612345678"),' +
  '(2, "Jimmy", "van Deursen", "Lisdodde", "Breda", false,  "Secret1!", "JimmyvanDeursen@gmail.com", "0612345678");';
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_MEAL_PARTICIPANT_TABLE =
  "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_MEAL_PARTICIPANT_TABLE + CLEAR_USERS_TABLE;

chai.should();
chai.use(chaiHttp);
// all tests below belong to the route api/user/
describe("Users", () => {
  describe("Testcases of UC-201, create a new user, api/user/ ", () => {
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

    it("TC-201-1 required field is missing. error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          // firstname is missing
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas1",
          emailAdress: "q.vandeursen@student.avans.nl",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("firstname must be of type string");
          done();
        });
    });

    it("TC-201-2 email is not valid. Error should be returned.", (done) => {
      // email format = quincyvandeursen@gmail.com
      chai
        .request(server)
        .post("/api/user")
        .send({
          // email format is incorrect '@' is missing)
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas1",
          emailAdress: "quincyvandeursengmail.com",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Emailaddress isn't valid");
          done();
        });
    });

    it("TC-201-3 password is not valid. Error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          // password format is incorrect, number is missing
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "SecretPas",
          phoneNumber: "0612345678",
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

    it("TC-201-4 Existing user. Error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas6",
          emailAdress: "Quincyvandeursen@gmail.com",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(409);
          message.should.be
            .a("string")
            .that.equals(
              `Creating user failed. There already is an user with the email 'Quincyvandeursen@gmail.com'.`
            );
          done();
        });
    });

    it("TC-201-5 succesfully registered user. Should return 201 code", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas6",
          emailAdress: "Quincyvandeursen2@gmail.com",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.should.be.a("object").that.contains({
            id: result.id,
            firstName: "Quincy",
            lastName: "van Deursen",
            street: "Lisdodde",
            city: "Breda",
            isActive: true,
            password: "SecretPas6",
            emailAdress: "Quincyvandeursen2@gmail.com",
            phoneNumber: "0612345678",
          });
          done();
        });
    });
  });

  describe("UC-202 Overzicht van gebruikers", () => {
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

    it("TC-202-1 show zero users.", (done) => {
      chai
        .request(server)
        .get("/api/user?length=0")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array").that.is.empty;
          done();
        });
    });

    it("TC-202-2 show two users.", (done) => {
      chai
        .request(server)
        .get("/api/user?length=2")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(2);
          done();
        });
    });

    it("TC-202-3 Show users with non existing name.", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=qqqqqqqqqqqq")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(0);
          done();
        });
    });

    it("TC-202-4 Show users with isActive = false.", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=false")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(1);
          done();
        });
    });

    it("TC-202-5 Show users with isActive = true.", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=false")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(1);
          done();
        });
    });

    it("TC-202-6 Show users with  existing name.", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=Quincy")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(1);
          done();
        });
    });
  });

  describe("UC-203 get Profile", () => {
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

    it("TC-203-1 unvalid token", (done) => {
      chai
        .request(server)
        .get(`/api/user/profile`)
        .set(
          "authorization",
          "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey) + "AN_UNVALID_PART"
        )
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.a("string").that.equals(`Not authorized`);
          done();
        });
    });

    it("TC-203-2 valid token", (done) => {
      chai
        .request(server)
        .get(`/api/user/profile`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("object").that.contains({
            id: result.id,
            firstName: "Quincy",
            lastName: "van Deursen",
            street: "Lisdodde",
            city: "Breda",
            isActive: 1,
            password: "Secret1!",
            emailAdress: "Quincyvandeursen@gmail.com",
            phoneNumber: "0612345678",
          });
          done();
        });
    });
  });

  describe("UC-204 Details van gebruiker", () => {
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

    it("TC-204-1 Unvalid token.", (done) => {
      let id = 1;
      chai
        .request(server)
        .get(`/api/user/${id}`)
        .set(
          "authorization",
          "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey + "AN_UNVALID_PART")
        )
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.a("string").that.equals(`Not authorized`);
          done();
        });
    });

    it("TC-204-2 Used id doesnt exist.", (done) => {
      let id = 999999999;
      chai
        .request(server)
        .get(`/api/user/${id}`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals(`Can not find user with ID ${id}`);
          done();
        });
    });

    it("TC-204-3 Used id does exists.", (done) => {
      chai
        .request(server)
        .get("/api/user/1")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(1);
          done();
        });
    });
  });

  describe("UC-205 Gebruiker wijzigen", () => {
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

    it("TC-205-1 required field email missing (put).", (done) => {
      chai
        .request(server)
        .put(`/api/user/1`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "Secret12",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("emailaddress must be of type string");
          done();
        });
    });

    it("TC-205-3 unvalid phoneNumber.", (done) => {
      chai
        .request(server)
        .put(`/api/user/2`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas1",
          emailAdress: "q.vandeursen@student.avans.nl",
          phoneNumber: "Unvalid",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Phonenumber isn't valid.");
          done();
        });
    });

    it("TC-205-4 Used id doesnt exist.", (done) => {
      let id = 99999999;
      chai
        .request(server)
        .put(`/api/user/${id}`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas1",
          emailAdress: "q.vandeursen@student.avans.nl",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals(
              "User doesn't exists, or not authorized to delete the user."
            );
          done();
        });
    });

    it("TC-205-5 not logged in.", (done) => {
      let id = 1;
      chai
        .request(server)
        .put(`/api/user/${id}`)
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas1",
          emailAdress: "q.vandeursen@student.avans.nl",
          phoneNumber: "0612345678",
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

    it("TC-205-6 updating user succesfull.", (done) => {
      chai
        .request(server)
        .put(`/api/user/2`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          firstName: "JimmyWithUpdatedName",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: true,
          password: "SecretPas1",
          emailAdress: "JimmyvanDeursen@gmail.com",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("string").that.equals("User with id 2 updated.");
          done();
        });
    });
  });

  describe("UC-206 Gebruiker verwijderen", () => {
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

    it("TC-206-1 deleting non existing user", (done) => {
      let id = 99999999;
      chai
        .request(server)
        .delete(`/api/user/${id}`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals(`User doesn't exists.`);
          done();
        });
    });

    it("TC-206-2 not logged in.", (done) => {
      chai
        .request(server)
        .delete(`/api/user/1`)
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals(`Authorization header missing!`);
          done();
        });
    });

    it("TC-206-3 user is not the owner.", (done) => {
      chai
        .request(server)
        .delete(`/api/user/2`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be
            .a("string")
            .that.equals(`Not authorized to delete the user.`);
          done();
        });
    });

    it("TC-206-4 deleting user succesfull", (done) => {
      chai
        .request(server)
        .delete(`/api/user/1`)
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be
            .a("string")
            .that.equals(`User with id ${1} succesfully deleted.`);
          done();
        });
    });
  });
});
