function changeToChatState() {
    $('#messageSpace').show();
    $('#messageSpace').html('');
}

function changeToMenuState() {
    $('#messageSpace').hide();
}

function showMessage(msgList) {
    var bindHTML = '';
    
    for (var message in msgList) {
        if (msgList[message].from.toString() == g_user.uid.toString()) {
            bindHTML += '<li class=' +"fromMe" + '>' + msgList[message].text+ '</li>'
        } else {
            bindHTML += '<li>' + msgList[message].text+ '</li>'
        }
    }
    $('#messageSpace').html(bindHTML);
}