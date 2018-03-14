

var referenceMap = [];
var clientReferenceMap = [];

//handleUserAuthentication(userList[0]);
// createChatChannel ();

// watchChatChannel('/channel/-L7XCshe2qzEsYGrgBbf/');


function sendMessage () {
    console.log("send");
    var message = $("#inputBox").val();
    updateChatChannel ('/channel/-L7XCshe2qzEsYGrgBbf/', message, g_user.uid);
}
    // ok
function getClientReferenceById (clientId) {
    console.log("getClientReference", clientId);
    var ret;
    $.each(clientReferenceMap, function(index, value) {
        if (value.id == clientId) {
            ret = value.reference;
        }
    })
    return ret;
}
    // ok
function clientReferenceMapping (userId) {
    return readData('/channel/' + getReferenceById(userId) + '/message').then(function(messageData) {
        for (var clientData in messageData) {
            clientReferenceMap.push({id:messageData[clientData].with, reference: clientData })
            // for (var myClient in messageData[userData].message) {
            //     clientReferenceMap.push({id: messageData[userData].message[myClient].with, reference: myClient})
            // }
        }
        console.log(clientReferenceMap);
    })
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
    return readData('/channel').then(function(messageData) {
        for (var userData in messageData) {
            referenceMap.push({id:messageData[userData].id, reference: userData })
            // for (var myClient in messageData[userData].message) {
            //     clientReferenceMap.push({id: messageData[userData].message[myClient].with, reference: myClient})
            // }
        }
    })

}


    // TODO: update message to the view
    function messageChangeCallback (messageArray) {
        console.log("message change", messageArray);
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

        var newUser = firebase.database().ref('/channel').push();
        newUser.set({
            id: user.uid,
            message : "init"
        }).then(function() {
            var temp = firebase.database().ref('/channel/'+newUser.key+'/message').push();
            temp.set({
                with : "soneoneId",
                textList: ""
            });
            return temp.key;
        }).then(function(ref){
            firebase.database().ref('/channel/'+newUser.key+'/message/'+ref+'/textList').push().set({
                isReceive: true,
                text: 'hi there!'
            });
        });
    }
    // ok
    
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
    // ok - unwatch is working
    function unWatchData (link, cb) {
        var starCountRef = firebase.database().ref(link);
        starCountRef.off('value', cb);
    }