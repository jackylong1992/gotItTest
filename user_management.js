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
    displayName: ''
};

const LOGIN = true;
const LOGOUT = false;

handleUserAuthentication(userList[0]);

// ok - when someone want to chat with you, they will change your user profile, then this function happen
function handleUserChange (data) {
    console.log('user change', data);
}

function updateUserStatus(status, referenceId) {
    var udpateValue = firebase.database().ref('users/' + referenceId);
    // Modify the 'first' and 'last' properties, but leave other data at
    // adaNameRef unchanged.
    udpateValue.update({ loginStatus: status, chatWith : '', isFree : true });
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
        bindHtml += '<li>' + list[user].name + '</li>';
    }
    $('#userList ul').html(bindHtml);
}