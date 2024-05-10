const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const app = express();
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')
const config = require('./config')
app.use(cors());

class DiscordServer {
    constructor() {
        this.app = app;
     }

    async mongoRun() {
        this.client = new MongoClient(config.uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        })
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await client.connect();
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } catch {
            throw new Error('App can not connect to database');
        }
        finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }

    serverRun() {
        this.server = http.createServer(app);
        this.server.listen(config.port, () => {
            console.log("SERVER IS RUNNING");
        });
    }

    setupCors() {
        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
            }
        })
    }

    bootstrap() {
        this.serverRun();
        this.mongoRun();
        this.setupCors();
    }
}

module.exports = {
    DiscordServer,
}