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
        // Modify the response to exclude reported and delete_password fields
        const sanitizedThreads = recentThreads.map((thread) => ({
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies: thread.replies.slice(0, 3).map((reply) => ({
            // Only include the most recent 3 replies
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on,
          })),
        }));
        res.json(sanitizedThreads);
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
          res.send("success");
        } else {
          res.send("incorrect password");
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
          res.send("reported");
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
        // Modify the response to exclude reported and delete_password fields
        const sanitizedThreadWithReplies = {
          _id: threadWithReplies._id,
          text: threadWithReplies.text,
          created_on: threadWithReplies.created_on,
          bumped_on: threadWithReplies.bumped_on,
          replies: threadWithReplies.replies.map((reply) => ({
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on,
          })),
        };
        res.json(sanitizedThreadWithReplies);
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
          // Change the text of the reply_id to "[deleted]" on success
          res.send("success");
        } else {
          res.send("incorrect password");
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
          res.send("reported");
        } else {
          res.status(404).json({ error: "Reply not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
};
