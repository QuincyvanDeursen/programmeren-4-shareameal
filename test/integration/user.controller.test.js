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

    it("TC-201-1 required field is missing (error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          // firstname is missing
          lastName: "van Deursen",
          emailAdress: "q.vandeursen@student.avans.nl",
          password: "secret",
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
  });
  describe("UC-202 Overzicht van gebruikers", () => {});

  describe("UC-203 Gebruikersprofiel opvragen", () => {});

  describe("UC-204 Details van gebruiker", () => {});

  describe("UC-205 Gebruiker wijzigen", () => {});

  describe("UC-206 Gebruiker verwijderen", () => {});
});
