const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let threadId;
  let replyId;
  let delete_password_thread;
  let delete_password_reply;

  test("Creating a new thread: POST /api/threads/:board", function (done) {
    chai
      .request(server)
      .post("/api/threads/testboard")
      .send({
        text: "Test Thread",
        delete_password: "testpassword",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "_id");
        threadId = res.body._id;
        delete_password_thread = res.body.delete_password;
        done();
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each: GET /api/threads/:board", function (done) {
    chai
      .request(server)
      .get("/api/threads/testboard")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("Deleting a thread with incorrect password: DELETE /api/threads/:board", function (done) {
    chai
      .request(server)
      .delete("/api/threads/testboard")
      .send({
        thread_id: threadId,
        delete_password: "wrongpassword",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Incorrect password");
        done();
      });
  });

  test("Reporting a thread: PUT /api/threads/:board", function (done) {
    chai
      .request(server)
      .put("/api/threads/testboard")
      .send({
        thread_id: threadId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Reported");
        done();
      });
  });

  test("Creating a new reply: POST /api/replies/:board", function (done) {
    chai
      .request(server)
      .post("/api/replies/testboard")
      .send({
        thread_id: threadId,
        text: "Test Reply",
        delete_password: "testpassword",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "_id");
        replyId = res.body._id;
        delete_password_reply = res.body.delete_password;
        done();
      });
  });

  test("Viewing a single thread with all replies: GET /api/replies/:board?thread_id={thread_id}", function (done) {
    chai
      .request(server)
      .get(`/api/replies/testboard?thread_id=${threadId}`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "_id");
        assert.property(res.body, "replies");
        assert.isArray(res.body.replies);
        done();
      });
  });

  test("Deleting a reply with incorrect password: DELETE /api/replies/:board", function (done) {
    chai
      .request(server)
      .delete("/api/replies/testboard")
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: "wrongpassword",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Incorrect password");
        done();
      });
  });

  test("Reporting a reply: PUT /api/replies/:board", function (done) {
    chai
      .request(server)
      .put("/api/replies/testboard")
      .send({
        thread_id: threadId,
        reply_id: replyId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Reported");
        done();
      });
  });

  test("Deleting a reply with correct password: DELETE /api/replies/:board", function (done) {
    chai
      .request(server)
      .delete("/api/replies/testboard")
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: delete_password_reply,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200, "Expected status code 200");
        assert.equal(res.text, "Success");
        done();
      });
  });

  test("Deleting a thread with correct password: DELETE /api/threads/:board", function (done) {
    chai
      .request(server)
      .delete("/api/threads/testboard")
      .send({
        thread_id: threadId,
        delete_password: delete_password_thread,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "Success");
        done();
      });
  });
});
