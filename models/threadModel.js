const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const threadSchema = new Schema({
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: { type: String, required: true },
  replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
