const { messageHandler, userHandler, channelHandler, channelJoinHandler, getChannelHandler, friendHandler } = require("./socketHandler");
const socketInitializer = (socket) => {
    console.log(`User Connected: ${socket.id}`)

    socket.on('message',(data) =>{messageHandler(socket,data)});
    socket.on('user',(data) =>{userHandler(socket,data)});
    socket.on('channel',(data) =>{channelHandler(socket,data)})
    socket.on('channelJoin',(data) =>{channelJoinHandler(socket,data)})
    socket.on('getChannel',(data) =>{getChannelHandler(socket,data)})
    socket.on('friend',(data) =>{friendHandler(socket,data)})
}
module.exports = {
    socketInitializer
}