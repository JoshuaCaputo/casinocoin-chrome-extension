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

    // Set up Event Listeners 
    document.getElementById("createAccount").addEventListener("click", createNewWallet);
    document.getElementById("importAccount").addEventListener("click", toggleImportExistingWallet);
    document.getElementById("cancelLoad").addEventListener("click", toggleImportExistingWallet);
    document.getElementById("submitLoad").addEventListener("click", importWallet);
    document.getElementById("depositFunds").addEventListener("click", toggleDepositScreen);
    document.getElementById("sendFunds").addEventListener("click", toggleSendScreen);
    document.getElementById("commit_send").addEventListener("click", handlePressedSend);
    document.getElementById("exitDepositFunds").addEventListener("click", toggleDepositScreen);
    
    $('.closeSend').click(toggleSendScreen);
    $('.account-badge').click(copyAccountToClipboard)
    $('.more-options').click(toggleMoreOptions)
    $('.logOut').click(logOut)
}


function checkAccount(address){
    main_account = address;

    $('.sign-in-screen').hide()
    $('.spinner-title').html('Loading Your Wallet...')
    $('.spinner-desc').html('This only takes a second or two.');
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
        $('.spinner-screen').show();
        $('.spinner-title').html('Welcome!')
        $('.spinner-desc').html('The gateway to the future of gaming');
        $('.sign-in-screen').show()
    });
});
}




function handlePressedSend() {
    console.log('Attempting to Send a Transaction')
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