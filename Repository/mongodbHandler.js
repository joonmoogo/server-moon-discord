const { database } = require("../Util/mongodb");

/* 몽고DB 로직 수행하는 함수모음집 */

const findUser = async (username) => {
    const collection = database.collection('User');
    /* 이름 안쳤네 */
    if (username == '') {
        return {
            data: null,
            message: '이름 없음 에러.'
        }
    }
    const data = await collection.findOne({ username: username })
    /*유저 있는 경우 */
    if (data) {
        return {
            data: data,
            message: 'db에서 유저 찾았음.',
        };
    }
    /*유저 없는 경우 */
    else {
        const userObject = {
            username: username,
            friends: [],
            channels: [],
            currentChannel: "",
        }
        await collection.insertOne(userObject)
        return {
            data: userObject,
            message: 'db에서 유저 없어서 새로 생성했음',
        }
    }
}

const findChannel = async (names) => {
    const { username, channelName } = names;
    const channelCollection = database.collection('Channel');
    const userCollection = database.collection('User');

    // 채널 찾았어
    const data = await channelCollection.findOne({ channelName: channelName })

    /* 이름 안쳤네 */
    if (channelName == '') {
        return {
            data: null,
            message: '이름 없음 에러.'
        }
    }

    /* DB에 채널이 이미 존재하는 경우 */
    if (data) {
        console.log(data);
        let userData = await userCollection.findOne({ username: username })
        // 그런데 유저한테는 채널이 없는 경우
        const channelExists = userData.channels.some(channel => channel.channelName === channelName);
        if (!channelExists) {
            await userCollection.updateOne(
                { username: username },
                {
                    $push: { channels: channelName },
                    // $set: { currentChannel: channelName },
                }
            )
            await channelCollection.updateOne(
                { channelName: channelName }, // 채널 이름이 일치하는 문서 찾기
                {
                    $push: { channelUsers: username }
                } // channelUsers 배열에 username 추가
            )
            userData = await userCollection.findOne({ username: username })
        }
        return {
            data: userData,
            message: 'db에서 채널 찾았음 데이터 보내드림',
        };
    }
    /*채널 없는 경우 */
    else {
        const channelObject = {
            channelName: channelName,
            channelUsers: [`${username}`], // 유저 이름들 배열
            chattingLogs: [], // 채팅방 기록들
        }
        await channelCollection.insertOne(channelObject)
        await userCollection.updateOne(
            { username: username }, // 찾고자 하는 조건
            {
                $push: { channels: channelName },
                // $set: { currentChannel: channelName },
            } // channels 배열에 channelObject 추가
        )
        const userData = await userCollection.findOne({ username: username })
        return {
            data: userData,
            message: 'db에 채널 없음 . 새로 생성함',
        };
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
            message: '친구 이미 있음',
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
    }
}

const channelUpdate = async (data) => {
    const { username, channelName } = data;
    const channelCollection = database.collection('Channel');
    const userCollection = database.collection('User');
    if (username && channelName) {
        await channelCollection.updateOne(
            { channelName: channelName }, // 채널 이름이 일치하는 문서 찾기
            { $push: { channelUsers: username } } // channelUsers 배열에 username 추가
        )
        await userCollection.updateOne(
            { username: username },
            {
                $set: { currentChannel: channelName },
                $push: { channels: channelName }
            }
        );
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
const getChannel = async (data) => {
    const { username, channelName } = data;
    const channelCollection = database.collection('Channel');
    const userCollection = database.collection('User');
    const channelData = await channelCollection.findOne({ channelName: channelName });
    await userCollection.updateOne(
        { username: username },
        {
            $set: { currentChannel: channelName },
        }
    );
    const userData = await userCollection.findOne({ username: username })
    if (userData && channelData) {
        return {
            data: { userData: userData, channelData: channelData },
            message: '찾았음'
        }
    }
    else {
        return {
            data: null,
            message: '못찾았음'
        }
    }
}

const messageService = async (data) => {
    const { room, text, username, time } = data;
    const channelCollection = database.collection('Channel');
    await channelCollection.updateOne(
        { channelName: room },
        {
            $push: { chattingLogs: data }
        }
    );
    return channelCollection.findOne({channelName:room})

}

module.exports = {
    findUser,
    findChannel,
    findFriend,
    channelUpdate,
    getChannel,
    messageService
}
