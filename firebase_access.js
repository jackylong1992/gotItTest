function createChatChannel () {
    var newChannel = firebase.database().ref('/channel').push();
    newChannel.set({
        between: "id combination",
        messageList : "init"
    })
}

function updateChatChannel (link, message, senderId) {
    var messageList = firebase.database().ref(link + 'messageList').push();
    messageList.set({
        from : senderId,
        text : message
    })
}

function watchChatChannel (link, cb) {
    var chatChannel = firebase.database().ref(link +'messageList');
    return chatChannel.on('value', function(childSnapshot, prevChildKey) {
        //console.log('new val =', prevChildKey);
        console.log('child added event');
        console.log(childSnapshot.val());
        if (cb) {
            cb(childSnapshot.val());
        }
    });
}