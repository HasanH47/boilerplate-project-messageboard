"use strict";

// routes/api.js
const Thread = require("../models/thread");
const Reply = require("../models/reply");

module.exports = function (app) {
  // Creating a new thread
  app.route("/api/threads/:board").post(async function (req, res) {
    try {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      const newThread = new Thread({
        text,
        delete_password,
      });

      await newThread.save();
      res.json(newThread);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Viewing the 10 most recent threads with 3 replies each
  app.route("/api/threads/:board").get(async function (req, res) {
    try {
      const { board } = req.params;

      const threads = await Thread.find({})
        .sort({ bumped_on: -1 })
        .limit(10)
        .populate({
          path: "replies",
          options: { sort: { created_on: -1 }, limit: 3 },
        });

      res.json(threads);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Deleting a thread with the incorrect password
  app.route("/api/threads/:board").delete(async function (req, res) {
    try {
      const { thread_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      if (thread.delete_password !== delete_password) {
        return res.json({ error: "incorrect password" });
      }

      await thread.remove();

      res.json({ success: "success" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Reporting a thread
  app.route("/api/threads/:board").put(async function (req, res) {
    try {
      const { thread_id } = req.body;

      const thread = await Thread.findById(thread_id);

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      thread.reported = true;
      await thread.save();

      res.json({ reported: "reported" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Creating a new reply
  app.route("/api/replies/:board").post(async function (req, res) {
    try {
      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;

      const thread = await Thread.findById(thread_id);

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const newReply = new Reply({
        text,
        delete_password,
      });

      thread.replies.push(newReply);
      await thread.save();

      res.json(newReply);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Viewing a single thread with all replies
  app.route("/api/replies/:board").get(async function (req, res) {
    try {
      const { thread_id } = req.query;

      const thread = await Thread.findById(thread_id).populate("replies");

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      res.json(thread);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Deleting a reply with the incorrect password
  app.route("/api/replies/:board").delete(async function (req, res) {
    try {
      const { thread_id, reply_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const reply = thread.replies.id(reply_id);

      if (!reply) {
        return res.status(404).json({ error: "Reply not found" });
      }

      if (reply.delete_password !== delete_password) {
        return res.json({ error: "incorrect password" });
      }

      reply.text = "[deleted]";
      await thread.save();

      res.json({ success: "success" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Reporting a reply
  app.route("/api/replies/:board").put(async function (req, res) {
    try {
      const { thread_id, reply_id } = req.body;

      const thread = await Thread.findById(thread_id);

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const reply = thread.replies.id(reply_id);

      if (!reply) {
        return res.status(404).json({ error: "Reply not found" });
      }

      reply.reported = true;
      await thread.save();

      res.json({ reported: "reported" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
