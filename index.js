const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
const {client,database} = require('./db')
app.use(cors());


async function insertDocument(collectionName, document) {
  try {
    const collection = database.collection(collectionName); // 사용할 컬렉션 이름
    const result = await collection.insertOne(document);
    console.log(`Inserted document with _id: ${result.insertedId}`);
  } finally {
    client.close();
  }
}

async function getDocuments(collectionName, query) {
  const client = new MongoClient(uri);

  try {
    const database = client.db('moon-discord');
    const collection = database.collection(collectionName); // 사용할 컬렉션 이름

    const result = await collection.findOne(query);
    return result;
  } finally {
    client.close();
  }
}

async function updataeDocuments(collectionName, query) {
  const client = new MongoClient(uri);

  try {
    const database = client.db('moon-discord');
    const collection = database.collection(collectionName); // 사용할 컬렉션 이름

    const result = await collection.updateOne(query);
    return result;
  } finally {
    client.close();
  }
}

const server = http.createServer(app);
server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get('/', (req, res) => {
  res.send('<h1>hello express</h1>')
})



io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('user', async (data) => {
    const { name } = data;
    if (name == null) return 0;
    const result = await getDocuments('User', { name: name })
    if (result == null) {
      const newUser = {
        name: name,
        friends: [],
        ChattingRooms: [],
      }
      await insertDocument('User', newUser);
      socket.emit('User', newUser);
    }
    else {
      socket.emit('User', result);
    }
  })

  socket.on('friend', async (data) => {
    const { userId, friendId } = data;
    if (friendId == null) return 0;
    const result = await getDocuments('User', { friends: friendId })
    if (result == null) {
      const newFriend = await getDocuments('User', { _id: friendId });
      await updataeDocuments('User',
        { id: userId },
        {
          $push: {
            friends: newFriend
          }
        }
      )
      socket.emit('friend', newFriend);
    }
  })

  socket.on('message', async (data) => {
    const { roomId, message } = data;
    if (message == null) return 0;

    await updataeDocuments('ChattingRoom',
    {_id:roomId},
    {
      $push:{
        roomMessage: message
      }
    }
  )
    socket.broadcast.emit('message', data);
  })

  socket.on('channel', async (data) => {
    const { name } = data;
    if(name == null) return 0;
    await insertDocument('ChattingRoom',{
      roomName:name,
      roomParticipant:[],
      roomMessage:[],
    })
    socket.emit('channel','channel is created')
    
  })
});

