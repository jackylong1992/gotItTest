(function(context) {
    var provider = new firebase.auth.GoogleAuthProvider();
    function startUserAuthentication () {
        return firebase.auth().signInWithPopup(provider).catch(function(error) {

        }).then(function(result) {
            /**
             * if (result.credential) {
             *     // This gives you a Google Access Token. You can use it to access the Google API.
             *     var token = result.credential.accessToken;
             *     // ...
             * }
             */
            handleUserAuthentication(result.user);
            return result;
        });
    }
})(mainModule);