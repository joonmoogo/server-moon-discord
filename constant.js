const SERVER_PORT = 3001
const CLIENT_URL_DEV = "http://localhost:3001"
const CLIENT_URL_PRODUCTION = "";
const MONGO_URI = 'mongodb+srv://junemuk:1998born@cluster0.deeugr7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

/* this variable determines whether to render HTML or not */
const IS_PRODUCTION = true;

module.exports = {
    CLIENT_URL_DEV,
    CLIENT_URL_PRODUCTION,
    MONGO_URI,
    SERVER_PORT,
    IS_PRODUCTION,
}


