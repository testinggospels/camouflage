const chai = require("chai"),
  chaiHttp = require("chai-http");
chai.use(chaiHttp);
let expect = chai.expect;
let should = chai.should();
const camouflage = require("../dist/index");
const path = require("path");
const http_mocks_dir = path.resolve("./mocks");
const ws_mocks_dir = path.resolve("./ws_mocks");
const grpc_mocks_dir = path.resolve("./grpc/mocks");
const grpc_protos_dir = path.resolve("./grpc/protos");
const key = path.resolve("./certs/server.key");
const cert = path.resolve("./certs/server.cert");
const configfile = path.resolve("./config.yml");
const grpc_host = "localhost";
const http_port = 8080;
const https_port = 8443;
const http2_port = 8081;
const ws_port = 802;
const grpc_port = 4312;
const https_enable = true;
const http2_enable = true;
const ws_enable = true;
const grpc_enable = true;
const log_level = "silent";
const backup_enable = true;
const backup_cron = "* 0 * * *";

let inputs = [
  http_mocks_dir,
  ws_mocks_dir,
  http_port,
  https_enable,
  http2_enable,
  grpc_enable,
  ws_enable,
  key,
  cert,
  https_port,
  http2_port,
  ws_port,
  grpc_host,
  grpc_port,
  grpc_mocks_dir,
  grpc_protos_dir,
  log_level,
  backup_enable,
  backup_cron,
  configfile,
];
describe("Camouflage Functional Test For HTTP", () => {
  let requester;
  before((done) => {
    camouflage.start(...inputs);
    camouflage.app.on("server-started", () => {
      requester = chai.request(camouflage.app).keepOpen();
      done();
    });
  });

  after((done) => {
    requester.close();
    done();
    process.exit(1);
  });
  it("Test GET /hello-world example", (done) => {
    requester.get("/hello-world").end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.have.property("greeting");
      res.body.should.have.property("greeting").eql("Hello World");
      done();
    });
  });
  it("Test GET /hello-world example with query", (done) => {
    requester.get("/hello-world?name=Shubhendu").end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.have.property("greeting");
      res.body.should.have.property("greeting").eql("Hello Shubhendu");
      done();
    });
  });
  it("Test POST /hello-world example", (done) => {
    const requestData = {
      nicknames: [
        {
          nickname: "bob",
        },
        {
          nickname: "robert",
        },
        {
          nickname: "bobby",
        },
      ],
    };
    requester
      .post("/hello-world")
      .send(requestData)
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.have.property("data");
        res.body.should.have.property("data").to.be.an("array").to.have.lengthOf(requestData.nicknames.length);
        done();
      });
  });
  it("Test GET /note example", (done) => {
    requester.get("/note").end((err, res) => {
      res.should.have.status(200);
      res.should.have.header("content-type");
      res.header["content-type"].should.contain("application/xml");
      done();
    });
  });
  it("Test GET /users example", (done) => {
    requester.get("/users").end((err, res) => {
      res.should.have.status(200);
      res.should.have.header("X-Requested-By");
      res.header["x-requested-by"].should.equal("Shubhendu Madhukar");
      res.should.be.json;
      res.body.should.have.property("phone");
      expect(res.body.phone.toString().length).eql(10);
      done();
    });
  });
  it("Test GET /users/get/* example", (done) => {
    const userId = 1212;
    const name = "Shubhendu";
    requester.get(`/users/get/${userId}?name=${name}`).end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.have.property("greeting");
      res.body.should.have.property("greeting").eql(`Hello ${name}`);
      res.body.should.have.property("userId");
      res.body.should.have.property("userId").eql(userId);
      done();
    });
  });
  it("Test POST /user/get/* example", (done) => {
    const userId = 1212;
    const requestData = {
      firstName: "Shubhendu",
      lastName: "Madhukar",
    };
    requester
      .post(`/users/get/${userId}`)
      .send(requestData)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("greeting");
        res.body.should.have.property("greeting").eql(`Hello ${requestData.lastName}, ${requestData.firstName}`);
        res.body.should.have.property("userId");
        res.body.should.have.property("userId").eql(userId);
        done();
      });
  });
  it("Test GET /code example", (done) => {
    const name = "Shubhendu";
    requester.get(`/code?name=${name}`).end((err, res) => {
      res.should.have.status(201);
      res.should.be.json;
      res.should.have.header("X-Requested-By");
      res.header["x-requested-by"].should.equal(name);
      res.body.should.have.property("greeting");
      res.body.should.have.property("greeting").eql(`Hello ${name}`);
      res.body.should.have.property("phone");
      expect(res.body.phone.toString().length).eql(10);
      done();
    });
  });
});
