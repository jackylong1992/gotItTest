(function () {
    // TODO: add failed case for api
    const LOGIN = 0;
    const LOGOUT = 1;
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function(error) {
        console.log(error);
    }).then(function(result) {
        console.log(result);
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
        // verify in server
        verifyUser().then(function(data) {

            for (var id in data) {
                if (data.hasOwnProperty(id)) {
                    // console.log(data[id]);
                    if (data[id].id === user.uid) {
                        userObj = {};
                        Object.assign(userObj, user);
                        break;
                    }
                }
            }
        }).then(function() {
            // if in server, update
            if (!userObj) {
                console.log("add user");
                addUser(user);
            } else { // if not in server, add user
                console.log("already in server");
            }
        });

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
        });
    }

    // read data at once
    // refer: https://firebase.google.com/docs/database/web/read-and-write
    function readFirstDataAtOnce () {
        return firebase.database().ref('/users').once('value').then(function(snapshot) {
            // var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            // ...
            console.log(snapshot.val());
          });
    }

    // refer: https://firebase.google.com/docs/database/web/read-and-write
    function readData () {
        var promise = new Promise (function (resolve, reject) {
            var starCountRef = firebase.database().ref('/users');
            starCountRef.on('value', function(snapshot) {
              console.log(snapshot.val());
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