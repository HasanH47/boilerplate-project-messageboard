"use strict";

const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

module.exports = function (app) {
  // Routes for threads

  app
    .route("/api/threads/:board")
    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      try {
        const newThread = await threadController.createThread(
          board,
          text,
          delete_password
        );
        res.json(newThread);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .get(async (req, res) => {
      const { board } = req.params;

      try {
        const recentThreads = await threadController.getRecentThreads(board);
        res.json(recentThreads);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      try {
        const result = await threadController.deleteThread(
          thread_id,
          delete_password
        );
        if (result) {
          res.send("Success");
        } else {
          res.send("Incorrect password");
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;

      try {
        const result = await threadController.reportThread(thread_id);
        if (result) {
          res.send("Reported");
        } else {
          res.status(404).json({ error: "Thread not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

  // Routes for replies
  app
    .route("/api/replies/:board")
    .post(async (req, res) => {
      const { board } = req.params;
      const { thread_id, text, delete_password } = req.body;

      try {
        const newReply = await replyController.createReply(
          thread_id,
          text,
          delete_password
        );
        res.json(newReply);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .get(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;

      try {
        const threadWithReplies = await replyController.getThreadReplies(
          thread_id
        );
        res.json(threadWithReplies);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;

      try {
        const result = await replyController.deleteReply(
          thread_id,
          reply_id,
          delete_password
        );
        if (result) {
          res.send("Success");
        } else {
          res.send("Incorrect password");
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      try {
        const result = await replyController.reportReply(reply_id);
        if (result) {
          res.send("Reported");
        } else {
          res.status(404).json({ error: "Reply not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
};
