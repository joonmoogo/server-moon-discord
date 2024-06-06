const { findUser, channelUpdate, findChannel } = require("./mongodbHandler");

const messageHandler = (data) => {
    console.log(data);
    insertDocument(data);
    socket.broadcast.emit('message', data);
}

const userHandler = async (socket, data) => {
    const userData = await findUser(data.name);
    console.log(userData)
    if (userData.data != null) socket.emit('user', userData)
}

const channelHandler = async (socket, data) => {
    const channelData = await findChannel(data.channelName);
    console.log(channelData)
    if (channelData.data != null) socket.emit('channel', channelData)
}

const channelJoinHandler = async (data) => {
    const dbData = await channelUpdate(data);
    console.log(dbData);
    if (dbData.data != null) socket.emit('channelJoin', foundData);
}

const getChannelHandler = async (data) => {
    const dbData = await channelUpdate(data);
    console.log(dbData);
    if (dbData.data != null) socket.emit('getChannel', serverData)
}

const friendHandler = async (data) => {
    const friendData = await findFriend(data);
    console.log(friendData);
    if (friendData.data != null) socket.emit('friendComplete', friendData)
}

module.exports = {
    messageHandler,
    userHandler,
    channelHandler,
    channelJoinHandler,
    friendHandler,
    getChannelHandler,
}