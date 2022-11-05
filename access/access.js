require("dotenv").config();
const MONGO_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGO_URL
    : process.env.MONGO_URL;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

module.exports = {
  MONGO_URI,
  PORT,
  SECRET,
};
