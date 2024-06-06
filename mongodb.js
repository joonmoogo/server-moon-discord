const { MongoClient, ServerApiVersion } = require('mongodb')
const { MONGO_URI } = require('./constant');

const client = new MongoClient(MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const database = client.db('moon-discord');

const mongoRun = async () => {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

module.exports = {
    client,
    database,
    mongoRun
}