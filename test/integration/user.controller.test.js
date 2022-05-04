const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
let database = [];

chai.should();
chai.use(chaiHttp);
// all tests below belong to the route api/user/
describe("Users", () => {
  describe("Testcases of UC-201, create a new user, api/user/ ", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    it("TC-201-1 required field is missing. error should be returned.", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          // firstname is missing
          lastName: "van Deursen",
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "Password1",
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
