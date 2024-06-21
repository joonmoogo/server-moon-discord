const onlineUsers = require("../GlobalStates/onlineUsers");
const { findUser, channelUpdate, findChannel, getChannel, messageService, findFriend } = require("../Repository/mongodbHandler");

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
    console.log(data);
    const channelData = await findChannel(data);
    console.log(channelData)
    if (channelData.data != null) socket.emit('channel', channelData.data)
}

const channelJoinHandler = async (io, socket, data) => {
    console.log(data);
    onlineUsers.userEnterRoom(socket.id, data.channelName);

    const dbData = await getChannel(data);
    console.log('dbData: ', dbData);
    const rooms = Object.keys(socket.rooms);
    console.log('Current rooms:', rooms);
    socket.leaveAll();
    socket.join(data.channelName);
    socket.join(socket.id);
    console.log('Updated rooms', socket.rooms);
    if (dbData.data != null) {
        socket.emit('channelJoin', dbData.data);
    }
};


const channelLeaveHandler = async (io, socket, data) => {
    console.log(data);
    onlineUsers.userEnterRoom(socket.id, data.channelName);
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
    const socketId = data;
    io.to(socketId).emit('friendRequest', { type: 1, message: "친구 요청받음", socketId: socketId });
}

const acceptFriendHandler = async (io, socket, data) => {
    // const friendData = await findFriend(data);
    // console.log(friendData);
    console.log(data);
}

const inviteChannelHandler = async (io, socket, data) => {
    const socketId = data;
    io.to(socketId).emit('inviteChannelRequest', { type: 2, message: "채널 초대받음", socketId: socketId });
}

const acceptInviteChannelHandler = async (io, socket, data) => {
    console.log(data);
}


const personalChattingHandler = async (io, socket, data) => {
    const socketId = data;
    io.to(socketId).emit('personalChattingRequest', { type: 3, message: "채팅 요청받음", socketId: socketId });
}

const acceptPersonalChattingHandler = async (io, socket, data) => {
    console.log(data);
}




module.exports = {
    messageHandler,
    userHandler,
    channelHandler,
    channelJoinHandler,
    channelLeaveHandler,
    friendHandler,
    getChannelHandler,
    disconnectHandler,
    acceptFriendHandler,
    inviteChannelHandler,
    acceptInviteChannelHandler,
    personalChattingHandler,
    acceptPersonalChattingHandler,
}