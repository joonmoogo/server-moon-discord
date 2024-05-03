const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://junemuk:<password>@cluster0.deeugr7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

async function insertDocument(collectionName, document) {
  const client = new MongoClient(uri);

  try {
    const database = client.db('moon-discord');
    const collection = database.collection(collectionName); // 사용할 컬렉션 이름

    // 데이터 생성
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
    const result = await getDocuments('User', { name: name })
    if(result == null){
      const newUser = {
        name: name,
        friends: [],
        ChattingRooms: [],
      }
      await insertDocument('User', newUser);
      socket.emit('User',newUser);
    }
    else{
      socket.emit('User',result);
    }
  })

  socket.on('message', (data) => {
    console.log(data);
    // insertDocument(data);
    socket.broadcast.emit('message', data);
  })

  socket.on('channel', (data) => {
    const { name } = data;

  })
});

