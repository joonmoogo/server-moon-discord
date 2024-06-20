const onlineUsers = require("../SingletonUsers");
const { findUser, channelUpdate, findChannel, getChannel, messageService } = require("../Repository/mongodbHandler");

/* 각 요청 이벤트 핸들러들임 */
const messageHandler = async (io, socket, data) => {
    await messageService(data);
    console.log(data);
    io.to(data.room).emit('message', data);
}

/* 유저가 접속하는 경우 */
const userHandler = async (io, socket, data) => {

    /* DB에서 유저 조회해서 가져오거나, 새로 만듬 */
    const userData = await findUser(data.name);

    /* 요청 잘 받은 경우 */
    if (userData.data != null) {

        /* 서버에 유저 로그인한 사실 알림 */
        const newUser = userData.data
        newUser.socketId = socket.id
        onlineUsers.userLogin(newUser);

        /* 찾은 데이터 보내줌 */
        socket.emit('user', userData.data);

        /* 서버에 접속한 유저들을 클라이언트 모두에게 보내줌 */
        io.emit('userlist', onlineUsers.getUsers());
    }
    console.log(onlineUsers.getUsers());
}

/* 유저가 접속 해제하는 경우 */
const disconnectHandler = async (io, socket) => {
    /* 접속 해제하는 socket의 id를 포함한 유저를 로그아웃 시킴 */
    onlineUsers.userLogout(socket.id);
    io.emit('userlist', onlineUsers.getUsers());
}

/* 채널을 생성하는 경우 */
const channelHandler = async (io, socket, data) => {
    const channelData = await findChannel(data);
    console.log(channelData)
    if (channelData.data != null) socket.emit('channel', channelData.data)
}

/**
 * @depriciated
 */
const channelJoinHandler = async (io, socket, data) => {
    console.log(data);
    const dbData = await channelUpdate(data);
    console.log('dbData: ', dbData);
    if (dbData.data != null) {
        // socket.join()
        socket.emit('channelJoin', dbData.data)
    };
}

const getChannelHandler = async (io, socket, data) => {
    const dbData = await getChannel(data);
    if (dbData.data != null) {
        socket.join(dbData.data.channelName);
        console.log(dbData.data.channelName);
        socket.emit('getChannel', dbData.data);
    }
}

const friendHandler = async (io, socket, data) => {
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
    disconnectHandler,
}