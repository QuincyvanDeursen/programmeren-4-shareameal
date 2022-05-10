const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");

const INSERT_USER =
  "INSERT INTO `user` (`firstName`, `lastName`, `street`, `city`, `isActive`, `emailAdress`, `password`, `phoneNumber` ) VALUES" +
  '("Quincy", "van Deursen", "Lisdodde", "Breda", 1, "Quincyvandeursen@gmail.com", "Secret1!", "061234567");';

const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_USERS_TABLE;

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
          lastName: "van Deursenn",
          street: "Lisdodde",
          city: "Breda",
          isActive: 1,
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "SecretPas1",
          phoneNumber: "061234567",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("AddUser: firstname must be of type string");
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
          emailAdress: "quincyvandeursengmail.com",
          password: "Password1",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("AddUser: emailaddress isn't valid");
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
          emailAdress: "quincyvandeursen@gmail.com",
          password: "Password",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals(
              "AddUser: password isn't valid (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
            );
          done();
        });
    });

    // it("TC-201-4 Existing user. Error should be returned.", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/user")
    //     .send({
    //       firstName: "Quincy",
    //       lastName: "van Deursen",
    //       emailAdress: "quincyvandeursen@gmail.com",
    //       password: "Password2",
    //     })
    //     .end((err, res) => {
    //       res.should.be.an("object");
    //       let { status, result } = res.body;
    //       status.should.equals(400);
    //       result.should.be
    //         .a("string")
    //         .that.equals(
    //           "AddUser: there is already an account with this emailaddress!"
    //         );
    //       done();
    //     });
    // });

    it("TC-201-5 succesfully registered user. Should return 201 code", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          // password format is incorrect, number is missing
          firstName: "Quincy",
          lastName: "van Deursen",
          emailAdress: "quincyvandeursen@gmail.com",
          password: "Password2",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.should.be.a("string").that.equals("gelukt");
          done();
        });
    });
  });

  describe("UC-202 Overzicht van gebruikers", () => {});

  describe("UC-203 Gebruikersprofiel opvragen", () => {});

  describe("UC-204 Details van gebruiker", () => {});

  describe("UC-205 Gebruiker wijzigen", () => {});

  describe("UC-206 Gebruiker verwijderen", () => {});
});
