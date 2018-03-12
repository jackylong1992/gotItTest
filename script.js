(function () {
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
        verifyUser(result.user);
    });

    // I need to find a way to add data before going to this function
    function verifyUser (user) {
        var userObj = {};
        // if not in server, add user
        addUser(user);
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
        var starCountRef = firebase.database().ref('/users');
        starCountRef.on('value', function(snapshot) {
          console.log(snapshot.val());
        });
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