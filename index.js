const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
require("dotenv").config();
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DEV_DB_URL;// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

async function insertDocument(document) {
  const client = new MongoClient(uri);

  try {
    const database = client.db('moon-discord');
    const collection = database.collection('moon-discord'); // 사용할 컬렉션 이름

    // 데이터 생성
    const result = await collection.insertOne(document);
    console.log(`Inserted document with _id: ${result.insertedId}`);
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

  socket.on('message', (data) => {
    console.log(data);
    insertDocument(data);
    socket.broadcast.emit('message', data);
  })

  socket.on('user', (async (username) => {
    await findUser(username.name);
  }));
  /** 
   @description
   유저 생성
   parameter = Username: string
   username받아서 mongoDB저장
   만약 username이 mongoDB에 있다면.. 가져와서 socket.emit('user',data)
   없다면 생성하고 socket.emit('user',data)
   
   username:string
   userChannel:[] 유저가 속한 채널들 배열
   friends:[] //유저 친구들 

   collection name = 'User'
 
  */



  const findUser = async (username) => {
    const client = new MongoClient(uri);
    try {
      const database = client.db('moon-discord');
      const collection = database.collection('User'); // 사용할 컬렉션 이름
      const data = await collection.findOne({ username: username })
      /*유저 있는 경우 */
      if (data) {
        socket.emit('user', data);
      }
      /*유저 없는 경우 */
      else {
        const userObject = {
          username: username,
          friends: [],
          channels: []
        }
        await collection.insertOne(userObject)
        socket.emit('user', userObject);
      }
    }
    finally {
      client.close();
    }
  }


  // 채널 생성
  // parameter = ChannelName : string
  // channelName받아서 mongoDB저장

  // 만약 channelName이 mongoDB에 있다면.. 가져와서 socket.emit('channel',data)
  // 없다면 생성하고 socket.emit('channel',data)

  // channelName : string
  // channelUsers:[] // 유저 이름들 배열
  // chattingLogs:[] // 채팅방 기록들
  // collection name = 'Channel'

  socket.on('channel', (async (channelName) => {
    await findChannel(channelName.channelName);
  }));


  const findChannel = async (channelName) => {
    const client = new MongoClient(uri);
    try {
      const database = client.db('moon-discord');
      const collection = database.collection('Channel'); // 사용할 컬렉션 이름
      const data = await collection.findOne({ channel: channelName })
      /*채널 있는 경우 */
      if (data) {
        socket.emit('channel', data);
      }
      /*채널 없는 경우 */
      else {
        const channelObject = {
          channelName: channelName,
          channelUsers: [], // 유저 이름들 배열
          chattingLogs: [], // 채팅방 기록들
        }
        await collection.insertOne(channelObject)
        socket.emit('channel', channelObject);
      }
    }
    finally {
      client.close();
    }
  }
  // socket.emit('channel',방금 추가한 채널)

  // socket.on('channelJoin');
  // 채널 입장
  // parameter = {username:string, channelName:string}
  // await db에서 채널이름 찾아서 channelUsers 배열에 유저 추가
  // await db에서 유저이름 찾아서 userChannel 배열에 채널 추가
  // await db에서 채널정보 channelName,chattingUsers,chattingLogs 찾아서 socket.emit('channeljoin',데이터)
  socket.on('channelJoin', async (data) => {
    const { username, channelName } = data;
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('moon-discord');
      const channelCollection = database.collection('Channel');
      await channelCollection.updateOne(
        { channelName: channelName }, // 채널 이름이 일치하는 문서 찾기
        { $push: { channelUsers: username } } // channelUsers 배열에 username 추가
      );
      const userCollection = database.collection('User');
      await userCollection.updateOne(
        { username: username },
        { $push: { channels: channelName } }
      )

      const foundData = await channelCollection.findOne({ channelName: channelName });
      socket.emit('channelJoin', foundData);
    } finally {
      client.close();
    }
  });


  socket.on('friend', async (data) => {
    try {
      const client = new MongoClient(uri);
      const database = client.db('moon-discord');
      const collection = database.collection('User'); // 사용할 컬렉션 이름
      const serverData = await collection.findOne({
        username: data.username,
        freinds: { $elemMatch: { $eq: data.friendName } }
      })
      /*친구 있는 경우 */
      if (serverData) {
        socket.emit('friendComplete', "friend already exists");
      }
      /*친구 없는 경우 */
      else {
        await collection.updateOne(
          { username: data.username },
          { $push: { friends: data.friendName } })
        socket.emit('friendComplete', serverData);
      }
    }
    finally {
      client.close();
    }
  });
  /**
  @description 
  // 친구 생성 
  // parameter = {username:string, friendName:string}
  // db에서 username 찾아서 friends배열에 friendName 추가
  // collection name = 'User'
   */

  // socket.emit('friend',방금 추가한 친구)
  socket.on('message', async (data) => {
    const { username, userMessage, createAt, channelName } = data;
    try {
      const client = new MongoClient(uri);
      const database = client.db('moon-discord');
      const collection = database.collection('Channel'); // 사용할 컬렉션 이름
      const data = await collection.findOne({ channelName: channelName })
      const chattingData = {
        username: username,
        userMessage: userMessage, // 유저 이름들 배열
        createAt: createAt
      }
      /*채널 있는 경우 */
      if (data) {
        await collection.updateOne(
          { channelName: channelName },
          { $push: { chattingLogs: chattingData } })
        socket.emit('message', chattingData);
      } else {
        socket.emit('message', "channel is not exist");
      }
    }
    finally {
      client.close();
    }
  });
  // socket.on('message');
  // 메세지 전달
  // parameter = {username:string, userMessage:string, channel:string}
  // db에서 채널 이름 찾아서 chattingLogs 배열에 메시지와 메세지 생성시간 추가
  // ex) {username:string, userMessage:string, createdAt:Timedata }
  // collection name = 'Channel'

  // socket.emit('message',방금 받은 채팅 기록) 
  // *브로드캐스팅.. 채널에 속한 사람들에게 전달해야함. 


  // flow 유저생성 -> 채널생성 -> 채널입장 -> 메세지 전달

});

