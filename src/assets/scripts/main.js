function init(){
    // Connect to CasinoCoin Server
    const server = 'wss://ws03.casinocoin.org:4443';
    api = new casinocoin.CasinocoinAPI({server:server});
    api.connect().then(function(a){
        console.log('Connected to CasinoCoin Server:', server);
        // Does the user have a wallet
        chrome.storage.sync.get(['address'], function(result) {
            const _address = result.address;
            if(_address != undefined && _address != null){
                console.log('Wallet found in Storage:', _address);
                checkAccount(_address);
            }
            else {
                console.log('No Wallet found in Storage');
                $('.sign-in-screen').show();
            };
        });
    });

    // Load Views & Set Up Event Listeners

    SettingsScreenController.load();

    $('[data-view="menu-bar"]').load('assets/views/menu-bar.html', () => {
        $('.dropdown-logout').click(logOut)
        $('.dropdown-settings').click(SettingsScreenController.toggle)
        $('.aboutExt').click(toggleAboutScreen)
    });
    $('[data-view="sign-in-screen"]').load('assets/views/sign-in-screen.html',() => {
        $('.btn-createAccount').click(createNewWallet);
        $('.btn-importAccount').click(toggleImportExistingWallet);
    });
    $('[data-view="import-screen"]').load('assets/views/import-screen.html',() => {
        $('#submitLoad').click(importWallet);
        $('#cancelLoad').click(toggleImportExistingWallet);
        $('.input_address').on('input', function(){
            $('.input_address').addClass('border-danger')
            if (WalletUtilities.isValidAddress($('.input_address').val())){
                $('.input_address').addClass('border-success').removeClass('border-danger');
            }
        })
        $('.input_secret').on('input', function(){
            $('.input_secret').addClass('border-danger')
            if (WalletUtilities.isValidSecret($('.input_secret').val())){
                $('.input_secret').addClass('border-success').removeClass('border-danger');
            }
        })
    });
    $('[data-view="main-screen"]').load('assets/views/main-screen.html',() => {
        $('#depositFunds').click(toggleDepositScreen);
        $('#sendFunds').click(toggleSendScreen);
        $('.account-badge').click(copyAccountToClipboard)
    });
    $('[data-view="history-screen"]').load('assets/views/history-screen.html',() => {});
    $('[data-view="about-screen"]').load('assets/views/about-screen.html',() => {
        $('.closeAbout').click(toggleAboutScreen);
    });
    $('[data-view="deposit-screen"]').load('assets/views/deposit-screen.html',() => {
        $('#exitDepositFunds').click(toggleDepositScreen);
    });

    $('[data-view="send-screen"]').load('assets/views/send-screen.html',() => {
        
        $('#commit_send').click(handlePressedSend);
        $('.more-options').click(toggleMoreOptions);
        $('.closeSend').click(toggleSendScreen);
        $('.r_address').on('input', function(){
            $('.r_address').addClass('border-danger')
            if (WalletUtilities.isValidAddress($('.r_address').val())){
                $('.r_address').addClass('border-success').removeClass('border-danger');
            }
        })
        $('.r_amount').on('input', function(){
            $('.r_amount').addClass('border-danger')
            if (($('.r_amount').val() > 0)){
                $('.r_amount').addClass('border-success').removeClass('border-danger');
            }
        })
    });

        
    chrome.storage.sync.get(['settings'], function(result) {
        const _settings = result.settings;
        if (!_settings){
            console.log('No Settings found');
        }
        else {
            console.log('Settings found', _settings);
            tools.changeTheme(_settings.theme)
        }
    });
    SpinnerScreenController.load();
}


function checkAccount(address){
    main_account = address;

    $('.sign-in-screen').hide()
    SpinnerScreenController.present(['Loading Your Wallet...', 'This only takes a second or two.']);
    $('.deposit-address').val(address)
    $('#qrcode').empty();
    var qrcode = new QRCode("qrcode", {
        text: address,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    $('#qrcode').find('img').addClass('m-auto')


    function handleOutcome(){
        $('.account_address').html(address.substring(0,16)+'...').attr('title', address);
        $('.spinner-screen').hide()
        $('.main-screen').show()
        $('.dropdown-logout').show();
    }

    api.getAccountInfo(address).then(info => {
        console.log("Account is Activated", info);
        $('.csc-balance').html(info.cscBalance)
        $(".account-badge").popover({
            content: '<span class="copy">click to copy account address</span>',
            html:  true,
            trigger: 'hover',
            placement: 'top'
        }); 
        handleOutcome();
        loadTransactions(address)
    }).catch(error => {
        if (error.message == "actNotFound"){
            console.log('Account is Disabled');
            $('.account-badge').addClass('badge-warning')    
            $(".account-badge").popover({
                title: 'Account Disabled',
                content: 'deposit funds to activate this account',
                html: false,
                trigger: 'hover',
                placement: 'top'
            }); 
        }
        else {
            console.log(error)
        }
        handleOutcome();
    })
}




function toggleMoreOptions(){
    $(".more-send-options").toggle();
    $('.more-options').html('more options')
    if ($(".more-send-options").is(":visible")){
        $('.more-options').html('less options')
    }
}

function copyAccountToClipboard(e){
        console.log(e.target.innerHTML)
        function copyToClipboard(element) {
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($(element).attr('title')).select();
            document.execCommand("copy");
            $temp.remove();
            $('.copy').html('address copied to clipboard')
        }
        copyToClipboard(e.target)
}


$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
    init()
});

function logOut(){
    // Save Wallet Credentials to Chrome
    console.log('Logging Out of Wallet')
    chrome.storage.sync.set({address: null}, () => {
    chrome.storage.sync.set({secret: null}, () => {
        hideAllScreens();

        SpinnerScreenController.present(['Welcome!', 'The gateway to the future of gaming']);

        $('.sign-in-screen').show();
        $('.dropdown-logout').hide();
    });
});
}




function handlePressedSend() {
    console.log('Attempting to Send a Transaction')

    
    if (!$('.r_address').hasClass('border-success')){
        $('.send-error-badge').html('invalid address format').show();
        return;
    }
    if (!$('.r_amount').hasClass('border-success')){
        $('.send-error-badge').html('must send more than 0 CSC').show();
        return;
    }
    toggleSendScreen();
    let data = {
        address: $('.r_address').val(),
        amount: $('.r_amount').val(),
        fees: $('.r_fees').val(),
        desc: $('.r_desc').val(),
        tag: $('.r_tag').val()
    }
    console.log(data)

    chrome.storage.sync.get(['address'], function(result) {
        if(result.address != undefined && result.address != null){
            console.log('Sending from the wallet found in Storage: ', result.address);
            chrome.storage.sync.get(['secret'], function(result2) {
                if(result2.secret != undefined && result2.secret != null){
                    console.log('using secret found in Storage: ', result2.secret);
                    sendFromTo([result.address, result2.secret], data);
                }
            });
        }
    });

}

function sendFromTo(_sender, _txData){
    
    const payment = {
    "source": {
        "address": _sender[0],
        "maxAmount": {
        "value": _txData['amount'],
        "currency": "CSC",
        "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
        }
    },
    "destination": {
        "address": _txData['address'],
        "amount": {
        "value": _txData['amount'],
        "currency": "CSC",
        "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
        }
    }
    };
    return api.preparePayment(_sender[0], payment).then(prepared =>
    {
        console.log(prepared)
        const signedTransaction = ( api.sign(prepared.txJSON, _sender[1]));
        console.log(signedTransaction)
        return api.submit(signedTransaction.signedTransaction)
        .then(result => {
            console.log(result)
        });
            });
}


const tools = new function(){
    let scope = this;

    this.changeTheme  = (theme) => {
        if (theme == 'dark'){
            $('.bg-light').addClass('bg-dark').removeClass('bg-light');
            $('.btn-outline-secondary').addClass('btn-outline-light')
            $('.btn-secondary').addClass('btn-light')
            $('.btn-default').addClass('text-light')
            $('label').addClass('text-light')
            $('.text-muted').addClass('text-secondary').removeClass('text-muted')
            $('.text-dark').addClass('text-light').removeClass('text-dark');
            $('.casino-coin-logo').attr('src', 'assets/img/casinocoin-logo-dark.png');
        }
        else if (theme == 'default'){
            $('.casino-coin-logo').attr('src', 'assets/img/casinocoin-logo-color.png');
            $('.bg-dark').addClass('bg-light').removeClass('bg-dark');
            $('.btn-outline-secondary').removeClass('btn-outline-light');
            $('.btn-secondary').removeClass('btn-light')
            $('.btn-default').removeClass('text-light')
            $('label').removeClass('text-light')
            $('.text-secondary').addClass('text-muted').removeClass('text-secondary')
            $('.text-light').addClass('text-dark').removeClass('text-light');
        }
    }
}


var SettingsScreenController = new function(){
    var controller = this;
    
    controller.element = '.settings-screen';

    controller.load = () => {
        $('[data-view="settings-screen"]').load('assets/views/settings-screen.html', () => {
            $(controller.element+' .btn-dismiss').click(controller.toggle);
            $(controller.element+' .btn-confirm').click(controller.saveSettings);
            $(controller.element+' .theme-input').change(controller.updated);
        });
    }

    controller.loadSetting = () => {
        
        chrome.storage.sync.get(['settings'], function(result) {
            const _settings = result.settings;
            if (!_settings){
                console.log('No Settings found');
            }
            else {
                console.log('Settings found', _settings);
                $(controller.element+' .theme-input').val(_settings.theme)
            }
            $(controller.element).show();
        });
    }

    controller.saveSettings = () => {
        let settings = {
            theme: $(controller.element+' .theme-input').val()
        }
        chrome.storage.sync.set({settings: settings}, () => {
            controller.toggle();
        });
    }

    controller.updated = () => {
        let settings = {
            theme: $(controller.element+' .theme-input').val()
        }
        tools.changeTheme(settings.theme)
    }

    controller.toggle = (_flag) => {
        if ($(controller.element).is(':visible')){
            $(controller.element).hide();
        }
        else {
            controller.loadSetting();
        }
    }

    return controller;
}