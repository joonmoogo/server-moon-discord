const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
require("dotenv").config();
app.use(cors());
const { mongoRun } = require("./mongodb");
const { socketInitializer } = require("./Controller/socket");

const server = http.createServer(app);
server.listen(3001, async () => {
  await mongoRun();
  console.log("SERVER IS RUNNING ON PORT 3001");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => { socketInitializer(io, socket) })

app.get('/', (req, res) => {
  res.send('<h1>hello express</h1>')
})

