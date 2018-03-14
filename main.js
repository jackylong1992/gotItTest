(function () {
    // TODO: add failed case for api
    const LOGIN = 0;
    const LOGOUT = 1;
    var provider = new firebase.auth.GoogleAuthProvider();
    var userTable = [];
    firebase.auth().signInWithPopup(provider).catch(function(error) {
        //console.log(error);
    }).then(function(result) {
        //console.log(result);
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = result.user;

        //readData();
        // 
        handleUserAuthentication(result.user);
    });

    // I need to find a way to add data before going to this function
    // TODO: this sequence must be refactor
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
                //console.log("add user");
                addUser(user);
            } else { // if in server, update
                //console.log("already in server, update user status in refid", refId);
                updateUserStatus(LOGIN, refId);
            }
            getOnlineUser(userList);
            getMessageLog(user.uid).then(function(myMessageLog){
                if (myMessageLog) {
                    console.log('my message log =', myMessageLog);
                } else {
                    console.error("can't get message log");
                }
            });
            //sendMessage();
            watchInboxMessage();
        });

    }

    function watchInboxMessage () {
        // cut new message to old message
        // notify user
    }
    // TODO: implement this when user open a chatbox
    function loadMessageHistory () {

    }
    // // NEXT: I got ref ID, time to send message when user click sent button
    // function sendMessage() {
    //     var userId = "oXO9aXq2IHehGf4JsKOhcOjWyGT1";
    //     refId = getRefIdFromUserId(userId);
    // }

    // TODO: optimize this function
    function getRefIdFromUserId(userId) {
        //console.log(userTable);
        var ret = "";
        $.each(userTable, function(index, value) {
            //console.log(value.userId.indexOf(userId));
            if (value.userId == userId) {
                ret = value.refId;
                return;
            }
        });
        return ret;
    }
    function getMessageLog (userId) {
        return readData('/channel').then(function(snapshot){
            // console.log("message log", snapshot)
            for (var key in snapshot) {
                if (snapshot.hasOwnProperty(key)) {
                    if (snapshot[key].id == userId) {
                        return snapshot[key];
                    }
                }
            }
            return null;
        });
    }
    function getOnlineUser(l_userList) {
        //console.log(l_userList);
        var onlineArray = [];
        for (var key in l_userList) {
            if (l_userList.hasOwnProperty(key)) {
                if (l_userList[key].loginStatus == 0) {
                    onlineArray.push(l_userList[key]);
                    userTable.push({refId: key, userId: l_userList[key].id});
                }
            }
        }
        console.log("online array", onlineArray);
    }

    function updateUserStatus(status, referenceId) {
        var udpateValue = firebase.database().ref('users/' + referenceId);
        // Modify the 'first' and 'last' properties, but leave other data at
        // adaNameRef unchanged.
        udpateValue.update({ loginStatus: status });
    }

    function verifyUser () {
        return readData('/users');
    }

    // wainting for binding signOut function
    function signOut () {
        firebase.auth().signOut();
    }

    //refer: https://firebase.google.com/docs/database/web/lists-of-data#append_to_a_list_of_data
    function addUser (user) {
        var newPostKey = firebase.database().ref('/users').push();
        newPostKey.set({
            id: user.uid,
            name: user.displayName,
            loginStatus : LOGIN,
            isFree : true
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

    // read data at once
    // refer: https://firebase.google.com/docs/database/web/read-and-write
    function readFirstDataAtOnce () {
        return firebase.database().ref('/users').once('value').then(function(snapshot) {
            //console.log(snapshot.val());
          });
    }

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

    function writeData(userID, value) {
        firebase.database().ref('users/' + userID).set({
          name: value.name,
          address: value.address
        }).catch(function (error) {
            console.log(error);
        });
      }
})();