function changeToChatState() {
    // $('#messageSpace').show();
    changeState('messageSpace');
    $('#chatContent').html('');
}

function changeToMenuState() {
    // $('#messageSpace').hide();
    changeState('container');
    updateTitle(g_user.displayName, '');
}

function showMessage(msgList) {
    var bindHTML = '';
    updateTitle(g_user.displayName, g_user.clientName);
    for (var message in msgList) {
        if (msgList[message].from.toString() == g_user.uid.toString()) {
            bindHTML += '<li class=' +"fromMe" + '>' + highlightURL(msgList[message].text)+ '</li>'
        } else {
            bindHTML += '<li>' + highlightURL(msgList[message].text) + '</li>'
        }
    }
    $('#chatContent').html(bindHTML);
}

function changeState (stateId) {
    $('#messageSpace').hide();
    $('#container').hide();
    $('#chooseUser').hide();
    switch (stateId) {
        case 'messageSpace':
        $('#messageSpace').show();
            break;
        case 'container':
        $('#container').show();
            break;
        case 'chooseUser':
        $('#chooseUser').show();
            break;
        defaut:
            break;
    }
    return;
}