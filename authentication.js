// TODO: cannot chat with myself
// TODO: cannot handle user login statue
// TODO: break promise chain still have error
// TODO: strang issue when add new member
// ok -verify user, if user is not craeted, crate user space and data space
// ok -if user is created, update user loginStatus
function updateTitle(user) {
    $('#title').html('this is test from ' + user.displayName);
}

function handleUserAuthentication (user) {
    var userObj;
    var refId = "";
    var userList;
    
    Object.assign(g_user, user);
    updateTitle(user);
    // verify in server
    verifyUser()
    .then(function(data) {
        userList = data;
        for (var id in data) {
            if (data.hasOwnProperty(id)) {
                if (data[id].id === user.uid) {
                    userObj = {};
                    Object.assign(userObj, user);
                    refId = id;
                    break;
                }
            }
        }
    })
    .then(function() {
        // if not in server, add user
        if (!userObj) {
            // console.log("add user");
            addUser(user);
        } else { // if in server, update
            // console.log("already in server, update user status in refid", refId);
            updateUserLoginStatus(LOGIN, refId);
        }
        
        
    }).then(function() {
        // when finish user sequence
        referenceMapping()
        
    })
    .then(function() {
        watchMyInfo(refId);
        watchUserList();
        //watchChatChannel('/channel/-L7XCshe2qzEsYGrgBbf/');
    });;
}