    var referenceMap = [];

    // TODO: what if send message without creating communication channel
    // this case do not happen when we add state, or it will reduce it-self
    function sendMessage () {
        // console.log("send");
        var message = $("#inputBox").val();
        updateChatChannel ( message, g_user.uid);
    }

    // ok - mapping from id to reference in channel space
    function getReferenceById (userId) {
        var ret;
        $.each(referenceMap, function(index, value) {
            if (value.id == userId) {
                ret = value.reference;
            }
        })
        return ret;
    }
    // ok - parse all user reference
    function referenceMapping () {
        return readData('/users').then(function(messageData) {
            for (var userData in messageData) {
                referenceMap.push({id:messageData[userData].id, reference: userData })
                // for (var myClient in messageData[userData].message) {
                //     clientReferenceMap.push({id: messageData[userData].message[myClient].with, reference: myClient})
                // }
            }
        })

    }

    // ok
    function verifyUser () {
        return readData('/users');
    }
    // ok
    //refer: https://firebase.google.com/docs/database/web/lists-of-data#append_to_a_list_of_data
    function addUser (user) {
        var newPostKey = firebase.database().ref('/users').push();
        newPostKey.set({
            id: user.uid,
            name: user.displayName,
            loginStatus : LOGIN,
            isFree : true,
            chatWith : ""
        });
    }
    
    // ok
    // refer: https://firebase.google.com/docs/database/web/read-and-write
    function readData (link) {
        var promise = new Promise (function (resolve, reject) {
            var starCountRef = firebase.database().ref(link);
            // starCountRef.on('value', function(snapshot) {
                // this could be .once()
            starCountRef.once('value', function(snapshot) {
                //console.log(snapshot.val());
                resolve(snapshot.val());
            });
        });
        return promise;
    }
    // ok - watch is working
    function watchData (link, cb) {
        var starCountRef = firebase.database().ref(link);
        return starCountRef.on('value', function(snapshot) {
            // console.log("data change",snapshot.val());
            if (cb) {
                cb(snapshot.val());
            }
        });
    }
    // TODO: we need to unwatch the watch channel
    function unWatchData (link, cb) {
        var starCountRef = firebase.database().ref(link);
        starCountRef.off('value', cb);
    }