const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const ip = require("ip");
const cookieParser = require("cookie-parser");
const studentRouter = require("./routes/students");
const tokenRouter = require("./routes/token");
const app = express();
const projectRouter = require("./routes/projects");
const homeRouter = require("./routes/home");
const requestRouter = require("./routes/requests");
const bodyParser = require("body-parser");

// Set host IP address environment variable
process.env.domain = `http://${ip.address()}`;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("views"));
app.use("/auth/student", studentRouter);
app.use("/token", tokenRouter);
app.use("/project", projectRouter);
app.use("/home", homeRouter);
app.use("/request", requestRouter);
app.use(bodyParser.json());
// 404 route
app.use((req, res) => {
  res.status(404).sendFile("/views/dash/404.html", { root: __dirname });
});

// Environment variables
const PORT = config.get("PORT");
const DB_URL = config.get("DB_URL");

// Connect to MongoDB
mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useCreateIndex: true },
  (err, result) => {
    if (err) {
      console.error("Couldn't connect to database, aborting...");
      process.exit(1);
    }
    console.log("Connected to MongoDB.");
  }
);

// Start the server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server live at port ${PORT}.`);
});
