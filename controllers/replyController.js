const Reply = require("../models/replyModel");
const Thread = require("../models/threadModel");

// Controller for handling reply-related operations

// Create a new reply for a thread
exports.createReply = async (threadId, text, deletePassword) => {
  try {
    const newReply = new Reply({
      text,
      delete_password: deletePassword,
    });

    const savedReply = await newReply.save();

    // Update the corresponding thread with the new reply
    await Thread.findByIdAndUpdate(threadId, {
      $push: { replies: savedReply._id },
      $set: { bumped_on: savedReply.created_on },
    });

    return savedReply;
  } catch (error) {
    throw error;
  }
};

// Get all replies for a thread
exports.getThreadReplies = async (threadId) => {
  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "replies",
        options: { sort: { created_on: -1 } },
      })
      .exec();

    if (!thread) {
      throw new Error("Thread not found");
    }

    return thread;
  } catch (error) {
    throw error;
  }
};

// Delete a reply by ID and delete password
exports.deleteReply = async (threadId, replyId, deletePassword) => {
  try {
    const reply = await Reply.findOneAndUpdate(
      { _id: replyId, delete_password: deletePassword },
      { text: "[deleted]" },
      { new: true }
    );

    if (reply) {
      // Now that the reply is marked as deleted, no need to update the thread
      return reply;
    } else {
      // Handle incorrect password or reply not found
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Report a reply by ID
exports.reportReply = async (replyId) => {
  try {
    const result = await Reply.findByIdAndUpdate(
      replyId,
      { reported: true },
      { new: true }
    );
    return result;
  } catch (error) {
    throw error;
  }
};
