const Thread = require("../models/threadModel");

// Controller for handling thread-related operations

// Create a new thread
exports.createThread = async (board, text, deletePassword) => {
  try {
    const newThread = new Thread({
      text,
      delete_password: deletePassword,
    });

    const savedThread = await newThread.save();
    return savedThread;
  } catch (error) {
    throw error;
  }
};

// Get the most recent 10 threads with 3 replies each
exports.getRecentThreads = async (board) => {
  try {
    const threads = await Thread.find()
      .sort({ bumped_on: -1 })
      .limit(10)
      .populate({
        path: "replies",
        options: { sort: { created_on: -1 }, limit: 3 },
      })
      .exec();

    return threads;
  } catch (error) {
    throw error;
  }
};

// Delete a thread by ID and delete password
exports.deleteThread = async (threadId, deletePassword) => {
  try {
    const result = await Thread.findOneAndDelete({
      _id: threadId,
      delete_password: deletePassword,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// Report a thread by ID
exports.reportThread = async (threadId) => {
  try {
    const result = await Thread.findByIdAndUpdate(
      threadId,
      { reported: true },
      { new: true }
    );
    return result;
  } catch (error) {
    throw error;
  }
};
