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

var g_user = {
    uid: '',
    displayName: '',
    onChannel: '',
    clientId: ''
};

const LOGIN = true;
const LOGOUT = false;


function chooseUser() {
    handleUserAuthentication(userList[$('#chooseUser').val()]);
    $('#container').css("display","block");
}
//handleUserAuthentication(userList[1]);
// api test ok


// ok - when someone want to chat with you, they will change your user profile, then this function happen
function handleUserChange (data) {
    console.log('my user info change', data);
    if (data.chatWith && data.chatWith.length) {
        // modify watch and sent link
        g_user.onChannel = data.chatWith;
        g_user.clientId = data.clientId;
        watchChatChannel();
        changeToChatState();
    } else {
        changeToMenuState();
    }
}

function updateUserLoginStatus(status, referenceId) {
    var udpateValue = firebase.database().ref('users/' + referenceId);
    // Modify the 'first' and 'last' properties, but leave other data at
    // adaNameRef unchanged.
    udpateValue.update({ loginStatus: status, chatWith : '', isFree : true });
}

function updateUserStatus(referenceId, isFree, chatWith, clientId) {
    var udpateValue = firebase.database().ref('users/' + referenceId);
    // Modify the 'first' and 'last' properties, but leave other data at
    // adaNameRef unchanged.
    udpateValue.update({chatWith : chatWith || '', isFree : isFree, clientId : clientId });
}

function isClientAvailable(reference) {
    return readData('/users/' + reference).then(function(data) {
        if (data.loginStatus && data.isFree) {
            return true;
        } else {
            return false;
        }
    })
}

function watchMyInfo(refId) {
    watchData('/users/' + refId, handleUserChange);
}
// TODO: we need wrapper for this to watch, unwatch data
function watchUserList () {
    watchData('/users', updateUserList);
}

function updateUserList (list) {
    // update userList to the view
    console.log('update user List', list);
    var bindHtml = '';
    $('#userList ul').html(bindHtml);
    for (var user in list) {
        bindHtml += '<li ' + 'id =' +list[user].id + '>' + list[user].name + '</li>';
    }
    $('#userList ul').html(bindHtml);
    $('#userList li').on('click', function() {
        g_user.clientId = this.id;
        var channelId = createChannelListId(this.id, g_user.uid);
        var promise = new Promise(function(resolve, reject) {
            var clientRef = getReferenceById(g_user.clientId);
            isClientAvailable(clientRef).then((isAcquired) => {
                if(!isAcquired) {
                    // console.log("client is busy");
                    reject();
                } else {
                    resolve();
                }
            })
        })
        .then(function() {
            
            return isChatChannelExist(channelId);
        }, function() {
            console.log("client is busy");
            return Promise.reject();
        })
        .then( (value) => {
            if (value === null) return;
            console.log('channel isExist =', value);
            if (value) {
                // get channel reference - auto get if channel exit
                // watch/update this channel
                watchChatChannel();
            } else {
                // create new channel
                var channelRef = createChatChannel(channelId)
                // get channel reference
                g_user.onChannel = channelRef;
                // watch/update this channel
                watchChatChannel();
            }
            
        }, function() {
            return Promise.reject();
        })
        .then(acquireClient, function() {
            return Promise.reject();
        })
    });
}

function createChannelListId (userId, clientId) {
    var ret;
    if (userId < clientId) {
        ret = userId + clientId;
    } else {
        ret = clientId + userId;
    }
    console.log('channel id = ', ret)
    return ret;
}
// TODO: when user list change, we have to update the reference
function acquireClient () {
    var clientRef = getReferenceById(g_user.clientId);
    updateUserStatus(clientRef, false, g_user.onChannel, g_user.uid);
    var myRef = getReferenceById(g_user.uid);
    updateUserStatus(myRef, false, g_user.onChannel, g_user.clientId);
    changeToChatState();
    return true;
}

function releaseClient () {
    if (!g_user.clientId)  {
        console.log("not connected to any client");
        return;
    }
    var clientRef = getReferenceById(g_user.clientId);
    updateUserStatus(clientRef, true, "", '');
    var myRef = getReferenceById(g_user.uid);
    updateUserStatus(myRef, true, '', '');
    g_user.clientId = '';
    changeToMenuState();
}