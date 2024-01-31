// models/reply.js
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
});

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
