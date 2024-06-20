/* 온라인 유저들 전역객체 */

class OnlineUsers {

    constructor() {
        this.array = [];
    }

    getUsers = () => {
        return this.array;
    }

    userLogin = (user) => {
        const existingUser = this.array.find(u => u.username === user.username);
        if (!existingUser) {
            this.array.push(user);
        }
    }

    userLogout = (socketId) => {
        this.array = this.array.filter(u => u.socketId !== socketId );
        console.log(this.array);
    }

}

const onlineUsers = new OnlineUsers();

module.exports = onlineUsers;
