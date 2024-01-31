const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Thread = require("../models/thread"); // Replace with your actual Thread model
const Reply = require("../models/reply"); // Replace with your actual Reply model

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Threads", function () {
    let threadId;

    test("Creating a new thread", function (done) {
      chai
        .request(server)
        .post("/api/threads/{board}") // Replace {board} with the actual board
        .send({
          text: "New thread text",
          delete_password: "password123",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.property(res.body, "text");
          assert.property(res.body, "created_on");
          assert.property(res.body, "bumped_on");
          assert.property(res.body, "reported");
          assert.property(res.body, "delete_password");
          assert.property(res.body, "replies");
          threadId = res.body._id; // Store the thread ID for later tests
          done();
        });
    });

    test("Viewing the 10 most recent threads with 3 replies each", function (done) {
      chai
        .request(server)
        .get("/api/threads/{board}") // Replace {board} with the actual board
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "Response should be an array");

          // Assuming your response contains an array of threads
          const threads = res.body;
          assert.isAtMost(
            threads.length,
            10,
            "Should return at most 10 threads"
          );

          threads.forEach((thread) => {
            assert.property(thread, "_id");
            assert.property(thread, "text");
            assert.property(thread, "created_on");
            assert.property(thread, "bumped_on");
            assert.property(thread, "reported");
            assert.property(thread, "delete_password");
            assert.property(thread, "replies");

            // Assuming replies is an array
            assert.isArray(thread.replies, "Replies should be an array");
            assert.isAtMost(
              thread.replies.length,
              3,
              "Should return at most 3 replies for each thread"
            );

            // Additional assertions based on your actual response structure
          });

          done();
        });
    });


    test("Deleting a thread with the incorrect password", function (done) {
      chai
        .request(server)
        .delete("/api/threads/{board}") // Replace {board} with the actual board
        .send({
          thread_id: threadId, // Use the stored thread ID from the previous test
          delete_password: "incorrect_password",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "incorrect password");
          done();
        });
    });

    test("Deleting a thread with the correct password", function (done) {
      chai
        .request(server)
        .delete("/api/threads/{board}") // Replace {board} with the actual board
        .send({
          thread_id: threadId, // Use the stored thread ID from the first test
          delete_password: "password123",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "success");
          done();
        });
    });

    test("Reporting a thread", function (done) {
      chai
        .request(server)
        .put("/api/threads/{board}") // Replace {board} with the actual board
        .send({
          thread_id: threadId, // Use the stored thread ID from the first test
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "reported");
          done();
        });
    });
  });

  suite("Replies", function () {
    let replyId;

    test("Creating a new reply", function (done) {
      chai
        .request(server)
        .post("/api/replies/{board}") // Replace {board} with the actual board
        .send({
          text: "New reply text",
          delete_password: "reply_password",
          thread_id: threadId, // Use the stored thread ID from the first test
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.property(res.body, "text");
          assert.property(res.body, "created_on");
          assert.property(res.body, "delete_password");
          replyId = res.body._id; // Store the reply ID for later tests
          done();
        });
    });

    test("Viewing a single thread with all replies", function (done) {
      // Your test logic for viewing a thread with all replies
      done();
    });

    test("Deleting a reply with the incorrect password", function (done) {
      chai
        .request(server)
        .delete("/api/replies/{board}") // Replace {board} with the actual board
        .send({
          thread_id: threadId, // Use the stored thread ID from the first test
          reply_id: replyId, // Use the stored reply ID from the first test
          delete_password: "incorrect_password",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "incorrect password");
          done();
        });
    });

    test("Deleting a reply with the correct password", function (done) {
      chai
        .request(server)
        .delete("/api/replies/{board}") // Replace {board} with the actual board
        .send({
          thread_id: threadId, // Use the stored thread ID from the first test
          reply_id: replyId, // Use the stored reply ID from the first test
          delete_password: "reply_password",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "success");
          done();
        });
    });

    test("Reporting a reply", function (done) {
      chai
        .request(server)
        .put("/api/replies/{board}") // Replace {board} with the actual board
        .send({
          thread_id: threadId, // Use the stored thread ID from the first test
          reply_id: replyId, // Use the stored reply ID from the first test
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "reported");
          done();
        });
    });
  });
});
