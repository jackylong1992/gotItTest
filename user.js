var userList = [
    {
        uid : 1111,
        displayName: "Long Nguyen"
    },
    {
        uid : 2222,
        displayName: "Loka Nguyen"
    },
    {
        uid : 3333,
        displayName: "Jacob Vu"
    },
    {
        uid : 4444,
        displayName: "Danny Hoang"
    }
];
const LOGIN = 0;
const LOGOUT = 1;
var referenceMap = [];
var clientReferenceMap = [];

//handleUserAuthentication(userList[0]);
// createChatChannel ();

watchChatChannel('/channel/-L7XCshe2qzEsYGrgBbf/');


function sendMessage () {
    console.log("send");
    var message = $("#inputBox").val();
    updateChatChannel ('/channel/-L7XCshe2qzEsYGrgBbf/', message, '2222');
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
// ok -verify user, if user is not craeted, crate user space and data space
// ok -if user is created, update user loginStatus
function handleUserAuthentication (user) {
    var userObj;
    var refId = "";
    var userList;
    
    // verify in server
    verifyUser().then(function(data) {
        userList = data;
        for (var id in data) {
            if (data.hasOwnProperty(id)) {
                // console.log(data[id]);
                if (data[id].id === user.uid) {
                    userObj = {};
                    Object.assign(userObj, user);
                    refId = id;
                    break;
                }
            }
        }
    }).then(function() {
        // if not in server, add user
        if (!userObj) {
            console.log("add user");
            addUser(user);
        } else { // if in server, update
            console.log("already in server, update user status in refid", refId);
            updateUserStatus(LOGIN, refId);
        }
        // when finish user sequence
        referenceMapping().then(function () {
            clientReferenceMapping(user.uid);
        }).then(function() {
            watchData('/users/' + refId, handleUserChange);
        });
        
    });
}
    // ok - when someone want to chat with you, they will change your user profile, then this function happen
    function handleUserChange (data) {
        var watchId;
        var watchLink = '/channel/' + getReferenceById(data.id) + '/message/' + getClientReferenceById(data.chatWith) + '/textList';
        if (!data.isFree) {
            // is occupy by other user
            // watch message data of data.chatWith field
            if (data.chatWith && data.chatWith.length) {
                watchId = watchData(watchLink, messageChangeCallback);
            }
        } else {
            // is free by other
            // un-watch message data of data.chatWith field
            unWatchData(watchLink, watchId);
        }
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
    function updateUserStatus(status, referenceId) {
        var udpateValue = firebase.database().ref('users/' + referenceId);
        // Modify the 'first' and 'last' properties, but leave other data at
        // adaNameRef unchanged.
        udpateValue.update({ loginStatus: status });
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
    // ok - unwatch is working
    function unWatchData (link, cb) {
        var starCountRef = firebase.database().ref(link);
        starCountRef.off('value', cb);
    }