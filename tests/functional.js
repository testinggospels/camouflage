let chai = require("chai");
let chaiHttp = require("chai-http");
let expect = chai.expect;
let app = require("../dist/index").app;
chai.use(chaiHttp);

before((done) => {
  require("../dist/index").start("./mocks", 8080, false, false, false, "", "", "", "", 8443, 8081, "", "", "./grpc/mocks", "./grpc/protos", "info");
  app.on("server-started", function () {
    setTimeout(() => {
      done();
    }, 1000);
  });
});
describe("GET /hello-world", () => {
  it("Should Have Status 200 and Return Greeting 'Hello World'", (done) => {
    chai
      .request(app)
      .get("/hello-world")
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("greeting");
        expect(res.body.greeting).to.equal("Hello World");
        done();
      });
  });
});
describe("GET /hello-world?name=John", () => {
  it("Should Have Status 200 and Return Greeting 'Hello John'", (done) => {
    chai
      .request(app)
      .get("/hello-world?name=John")
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("greeting");
        expect(res.body.greeting).to.equal("Hello John");
        done();
      });
  });
});
describe("POST /hello-world", () => {
  it("Should Have Status 201 and Have data property of type Array and length 2", (done) => {
    chai
      .request(app)
      .post("/hello-world")
      .send({
        firstName: "Robert",
        lastName: "Downey",
        nicknames: [
          {
            nickname: "Bob",
          },
          {
            nickname: "Rob",
          },
        ],
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status");
        expect(res.body.status).to.equal(201);
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.be.instanceOf(Array);
        expect(res.body.data).to.have.lengthOf(2);
        done();
      });
  });
});
describe("GET /note", () => {
  it("Should Have Status 200 and a XML body", (done) => {
    chai
      .request(app)
      .get("/note")
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(200);
        expect(res.headers).to.have.property("content-type");
        expect(res.headers["content-type"]).to.contain("application/xml");
        done();
      });
  });
});
describe("GET /users", () => {
  it("Should Have Status 200 and a property phone", (done) => {
    chai
      .request(app)
      .get("/users")
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("phone");
        done();
      });
  });
});
describe("GET /users/get/1293?name=John", () => {
  it("Should Have Status 200, and properties greeting and userId. userId should be 1293 and greeting should be Hello John", (done) => {
    chai
      .request(app)
      .get("/users/get/1293?name=John")
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("greeting");
        expect(res.body).to.have.property("userId");
        expect(res.body.greeting).to.be.equal("Hello John");
        expect(res.body.userId).to.be.equal(1293);
        done();
      });
  });
});
describe("POST /users/get/1293", () => {
  it("Should Have Status 200, and properties greeting and userId. userId should be 1293 and greeting should be Hello Doe, John", (done) => {
    chai
      .request(app)
      .post("/users/get/1293")
      .send({
        firstName: "John",
        lastName: "Doe",
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("greeting");
        expect(res.body).to.have.property("userId");
        expect(res.body.greeting).to.be.equal("Hello Doe, John");
        expect(res.body.userId).to.be.equal(1293);
        done();
      });
  });
});

