/* 온라인 유저들 전역객체 */

class OnlineUsers {

    constructor() {
        this.userArray = [];
        this.roomArray = [];
    }

    getUsers = () => {
        return this.userArray;
    }

    userLogin = (user) => {
        const existingUser = this.userArray.find(u => u.username === user.username);
        if (!existingUser) {
            this.userArray.push(user);
        }

        return;
    }

    userLogout = (socketId) => {
        this.userArray = this.userArray.filter(u => u.socketId !== socketId);
        console.log(this.userArray);
        return;
    }

    userEnterRoom = (socketId, roomname) => {
        const user = this.userArray.find(u => u.socketId === socketId);
        let channelObj = this.roomArray.find(room => room.name === roomname);
        if (channelObj) {
            const userExists = channelObj.users.some(u => u.socketId === socketId);
            if (!userExists) {
                channelObj.users.push(user);
            }
        } else {
            channelObj = { name: roomname, users: [user] };
            this.roomArray.push(channelObj);
        }

        console.log(this.roomArray);
    }

    userLeaveRoom = (socketId) => {
        for (let i = 0; i < this.roomArray.length; i++) {
            const room = this.roomArray[i];
            const userIndex = room.users.findIndex(u => u.socketId === socketId);

            if (userIndex !== -1) {
                room.users.splice(userIndex, 1);

                if (room.users.length === 0) {
                    this.roomArray.splice(i, 1);
                }

                return;
            }
        }
    }

}

const onlineUsers = new OnlineUsers();

module.exports = onlineUsers;
