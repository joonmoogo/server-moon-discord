const { database } = require("./mongodb");

const findUser = async (username) => {
    const collection = database.collection('User');
    /* 이름 안쳤네 */
    if (username == '') {
        return {
            data: null,
            message: '얘 이름 안쳤음.'
        }
    }
    const data = await collection.findOne({ username: username })
    /*유저 있는 경우 */
    if (data) {
        // socket.emit('user', data);
        return {
            data: data,
            message: 'db에서 유저 찾았음. 이건 걔 데이터임',
        };
    }
    /*유저 없는 경우 */
    else {
        const userObject = {
            username: username,
            friends: [],
            channels: []
        }
        await collection.insertOne(userObject)
        return {
            data: userObject,
            message: 'db에서 유저 없어서 새로 생성했음',
        }
        // socket.emit('user', userObject);
    }
}

const findChannel = async (channelName) => {
    const collection = database.collection('Channel');
    const data = await collection.findOne({ channel: channelName })
    if (data) {
        // socket.emit('channel', data);
        return {
            data: data,
            message: 'db에서 채널 찾았음 데이터 보내드림',
        };
    }
    /*채널 없는 경우 */
    else {
        const channelObject = {
            channelName: channelName,
            channelUsers: [], // 유저 이름들 배열
            chattingLogs: [], // 채팅방 기록들
        }
        await collection.insertOne(channelObject)

        return {
            data: channelObject,
            message: 'db에 채널 없음 . 새로 생성함',
        };
        // socket.emit('channel', channelObject);
    }
}

const findFriend = async (data) => {
    const { username, friendName } = data;
    const collection = database.collection('User'); // 사용할 컬렉션 이름
    const dbData = await collection.findOne({
        username: username,
        freinds: { $elemMatch: { $eq: friendName } }
    })
    if (dbData) {
        return {
            data: data,
            message: '친구 있음 추가 없음',
        };
    }
    else {
        await collection.updateOne(
            { username: data.username },
            { $push: { friends: data.friendName } })
        return {
            data: data,
            message: '친구 없었음. 새로 생성함',
        };
        // socket.emit('channel', channelObject);
    }
}

const channelUpdate = async (data) => {
    const { username, channelName } = data;
    const channelCollection = database.collection('Channel');
    if (username && channelName) {
        await channelCollection.updateOne(
            { channelName: channelName }, // 채널 이름이 일치하는 문서 찾기
            { $push: { channelUsers: username } } // channelUsers 배열에 username 추가
        )
        const userCollection = database.collection('User');
        await userCollection.updateOne(
            { username: username },
            { $push: { channels: channelName } }
        )
        const foundData = await channelCollection.findOne({ channelName: channelName });
        return {
            data: foundData,
            message: '유저 채널 조인했음, 채널과 유저 db 변경'
        }
    }
    else {
        return {
            data: null,
            message: '데이터 제대로 못받았음'
        }
    }
}

module.exports = {
    findUser,
    findChannel,
    findFriend,
    channelUpdate
}
