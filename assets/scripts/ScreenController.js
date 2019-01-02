function toggleDepositScreen(){
    if ($('.deposit-screen').is(':visible')){
        $('.history-screen').show();
        $('.main-screen').show();
        $('.deposit-screen').hide();
    }
    else {
        $('.history-screen').hide();
        $('.main-screen').hide();
        $('.deposit-screen').show();
    }
}
function toggleSendScreen(){
    if ($('.send-screen').is(':visible')){
        $('.history-screen').show();
        $('.main-screen').show();
        $('.send-screen').hide();
    }
    else {
        $('.history-screen').hide();
        $('.main-screen').hide();
        $('.send-screen').show();
    }
}
function toggleImportExistingWallet(){
    if (!$('.sign-in-screen').is(':visible')){
        $('.sign-in-screen').show()
        $('.import-screen').hide()
        return;
    }

    $('.sign-in-screen').hide()
    $('.import-screen').show()
}

const screens = ['.sign-in-screen', '.history-screen', '.main-screen', '.send-screen', '.deposit-screen', '.spinner-screen'];
function hideAllScreens(){
    for (let index = 0; index < screens.length; index++) {
        const element = screens[index];
        $(element).hide();
    }
}