const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
require("dotenv").config();
app.use(cors());
const { mongoRun } = require("./Util/mongodb");
const { socketInitializer } = require("./Controller/socket");
const { CLIENT_URL, SERVER_PORT } = require("./constant");

const server = http.createServer(app);

server.listen(SERVER_PORT, async () => {
  await mongoRun();
  console.log("SERVER IS RUNNING ON PORT 3001");
});

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => { socketInitializer(io, socket) })


