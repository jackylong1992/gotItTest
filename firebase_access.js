function createChatChannel (channelId) {
    console.log('create chat channel');
    var newChannel = firebase.database().ref('/channel').push();
    newChannel.set({
        between: channelId,
        messageList : "init"
    });
    return newChannel.key;
}

function updateChatChannel ( message, senderId) {
    var messageList = firebase.database().ref('/channel/' +g_user.onChannel + '/messageList').push();
    messageList.set({
        from : senderId,
        text : message
    })
}

function watchChatChannel ( cb) {
    var chatChannel = firebase.database().ref('/channel/' + g_user.onChannel +'/messageList');
    return chatChannel.on('value', function(childSnapshot, prevChildKey) {
        //console.log('new val =', prevChildKey);
        console.log('child added event');
        console.log(childSnapshot.val());
        if (cb) {
            cb(childSnapshot.val());
        }
    });
}

function isChatChannelExist (channelId) {
    return readData('/channel').then(function(data) {
        for (var channel in data) {
            if(data[channel].between == channelId) {
                g_user.onChannel = channel;
                return true;
            }
        }
        return false;
    })
}

// example use
// isChatChannelExist('11112221').then(function (value) {
//     console.log('channel isExist =', value);
// }) 