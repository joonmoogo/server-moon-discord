const { messageHandler, userHandler, channelHandler, channelJoinHandler, getChannelHandler, friendHandler, disconnectHandler } = require("./socketHandler");

/* socket 요청 받는 이벤트들임 */
const socketInitializer = (io, socket) => {
    console.log(`User Connected: ${socket.id}`)

    socket.on('message', (data) => {
        messageHandler(io, socket, data)
    });
    // 메세지 주고 받기
    socket.on('user', (data) => { userHandler(io, socket, data) });
    // 유저 로그인할 때
    socket.on('disconnect', () => disconnectHandler(io, socket));
    // 유저 로그아웃할 때 
    socket.on('channel', (data) => { channelHandler(socket, data) })
    // 채널 생성할 때
    socket.on('channelJoin', (data) => { channelJoinHandler(socket, data) })
    // 채널 입장할 때
    socket.on('getChannel', (data) => { getChannelHandler(socket, data) })
    // 채널 가져오기 요청
    socket.on('friend', (data) => { friendHandler(socket, data) })
    // 친구 추가

    /*
        TODO
        1) user들어오면 모든 같은 채널 있는 사람들에게 알려야됨 ✔️
        2) user가 channel join하면 같은 채널있는 사람들에게 알려야됨
        3) 채팅방 나가면 모든 사람들에게 나갔다고 알려야됨 ✔️
        4) 현재 유저가 라이브인지 아닌지 서버에서 알고있어야됨 ✔️
        5) 그냥 오른쪽 탭에 모두 현재 접속자 띄우기✔️
        6) 친구는 이새기 친구다 하고 아이콘 옆에 표시만 하자
        7) user 나가면 모든 같은 채널 있는 사람들에게 알려야됨 ✔️

        설명
        -TAB 1) 유저가 Join한 모든 채널들을 리스트함
        -TAB 2) 채널안에 들어와있는 모든 유저들을 리스트함
        -TAB 3) 채널안에서의 채팅임 혹은 유저와의 개인 채팅임
        -TAB 4) 모든 유저들이 존재하는 리스트임, 친구인 경우에는 약간은 다른 UI를 가져야함
    */
}
module.exports = {
    socketInitializer
}