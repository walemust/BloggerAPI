const http = require("http");
const app = require("./index");
const { PORT } = require("./access/access");

const server = http.createServer(app);
server.listen(PORT, () =>
  console.log(`Running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
