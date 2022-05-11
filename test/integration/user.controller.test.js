const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const dbconnection = require("../../database/dbconnection");
const { expect } = require("chai");

const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `street`, `city`, `isActive`, `emailAdress`, `password`, `phoneNumber` ) VALUES" +
  '(1, "Quincy", "van Deursen", "Lisdodde", "Breda", 1, "Quincyvandeursen@gmail.com", "Secret1!", "061234567"),' +
  '(2, "Jimmy", "van Deursen", "Lisdodde", "Breda", 1, "JimmyvanDeursen@gmail.com", "Secret1!", "061234567");';
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_MEAL_PARTICIPANT_TABLE =
  "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_DB =
  CLEAR_MEAL_PARTICIPANT_TABLE + CLEAR_USERS_TABLE + CLEAR_MEAL_TABLE;

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
          isActive: 1,
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "SecretPas1",
          phoneNumber: "061234567",
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
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: 1,
          emailAdress: "quincyvandeursengmail.com",
          password: "SecretPas1",
          phoneNumber: "061234567",
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
          isActive: 1,
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "SecretPas",
          phoneNumber: "061234567",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals(
              "password isn't valid (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
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
          isActive: 1,
          emailAdress: "Quincyvandeursen@gmail.com",
          password: "SecretPas6",
          phoneNumber: "061234567",
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
          isActive: 1,
          emailAdress: "Quincyvandeursen2@gmail.com",
          password: "SecretPas6",
          phoneNumber: "061234567",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.should.be
            .a("string")
            .that.equals(`User Quincy van Deursen created`);
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
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          expect(result).to.have.lengthOf(2);
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

    it("TC-204-2 Used id doesnt exist.", (done) => {
      let id = 999999999;
      chai
        .request(server)
        .get(`/api/user/${id}`)
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

    it("TC-205-1 required field missing (put).", (done) => {
      chai
        .request(server)
        .put(`/api/user/1`)
        .send({
          //first name missing
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: 1,
          emailAdress: "Quincyvandeursen@gmail.com",
          password: "Secret1!",
          phoneNumber: "061234567",
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

    it("TC-205-4 Used id doesnt exist.", (done) => {
      let id = 99999999;
      chai
        .request(server)
        .put(`/api/user/${id}`)
        .send({
          firstName: "Quincy",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: 1,
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "SecretPas1",
          phoneNumber: "061234567",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Updating user failed.");
          done();
        });
    });

    it("TC-205-6 updating user succesfull.", (done) => {
      chai
        .request(server)
        .put(`/api/user/1`)
        .send({
          firstName: "QuincyWithUpdatedName",
          lastName: "van Deursen",
          street: "Lisdodde",
          city: "Breda",
          isActive: 1,
          emailAdress: "Quincyvandeursen@gmail.com",
          password: "SecretPas1",
          phoneNumber: "061234567",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("string").that.equals("User with id 1 updated.");
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
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals(`User with id ${id} not found.`);
          done();
        });
    });

    it("TC-206-4 deleting user succesfull", (done) => {
      chai
        .request(server)
        .delete(`/api/user/1`)
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
