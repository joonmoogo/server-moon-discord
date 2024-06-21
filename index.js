const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
require("dotenv").config();
app.use(cors());
const { mongoRun } = require("./Util/mongodb");
const { socketInitializer } = require("./Controller/socket");
const { CLIENT_URL_DEV, SERVER_PORT, IS_PRODUCTION } = require("./constant");
const path = require("path");

const server = http.createServer(app);
server.listen(SERVER_PORT, async () => {
  await mongoRun();
  console.log("SERVER IS RUNNING ON PORT 3001");
});

const io = new Server(server, {
  cors: {
    origin: '/',
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => { socketInitializer(io, socket) })

if (IS_PRODUCTION) app.use(express.static(path.join(__dirname, '/dist')))

app.get('/', (request, response) => {
  const obj = { name: 'moon-discord', port: SERVER_PORT }
  response.json(obj);
})