(function () {
    // TODO: add failed case for api
    const LOGIN = 0;
    const LOGOUT = 1;
    var provider = new firebase.auth.GoogleAuthProvider();
    var refIdAndUserId = [];
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
    // NEXT: I got ref ID, time to send message when user click sent button
    function sendMessage() {
        var userId = "oXO9aXq2IHehGf4JsKOhcOjWyGT1";
        refId = getRefIdFromUserId(userId);
    }

    // TODO: optimize this function
    function getRefIdFromUserId(userId) {
        //console.log(refIdAndUserId);
        var ret = "";
        $.each(refIdAndUserId, function(index, value) {
            //console.log(value.userId.indexOf(userId));
            if (value.userId == userId) {
                ret = value.refId;
                return;
            }
        });
        return ret;
    }

    function getOnlineUser(l_userList) {
        //console.log(l_userList);
        var onlineArray = [];
        for (var key in l_userList) {
            if (l_userList.hasOwnProperty(key)) {
                if (l_userList[key].loginStatus == 0) {
                    onlineArray.push(l_userList[key]);
                    refIdAndUserId.push({refId: key, userId: l_userList[key].id});
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
        return readData();
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
            firebase.database().ref('/channel/'+newUser.key+'/message').push().set({
                from : "jacky",
                text: ""
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
    function readData () {
        var promise = new Promise (function (resolve, reject) {
            var starCountRef = firebase.database().ref('/users');
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