const ACCESS = require("./access/access");
const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const user = require("./routes/userRoute");
const login = require("./controllers/login");
const blog = require("./routes/blogRoute");
const cors = require("cors");

const app = express();

// connect to db
require("./middleware/database")(ACCESS.MONGO_URI);

app.use(cors())

// parse information from request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/user", user);
app.use("/api/login", login);
app.use("/api/blog", blog);

// use error handler middleware
app.use(errorHandler);

module.exports = app;
