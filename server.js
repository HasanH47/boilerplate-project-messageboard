"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();
app.use(
  helmet({
    frameguard: { action: "sameorigin" }, // X-Frame-Options
    dnsPrefetchControl: { allow: false }, // X-DNS-Prefetch-Control
    referrerPolicy: { policy: "same-origin" }, // Referrer-Policy
  })
);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle connection errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});
// Serve static files from the 'public' folder
app.use("/public", express.static(process.cwd() + "/public"));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({ origin: "*" })); // For FCC testing purposes only

// Parse incoming request bodies in JSON format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end routes
app.route("/b/:board/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});

app.route("/b/:board/:threadid").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

// Start the server and tests
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
