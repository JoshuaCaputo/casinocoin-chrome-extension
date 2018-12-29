function createNewWallet(){
    // Generate a wallet via API
    wallet = api.generateAddress();

    // Save Wallet Credentials to Chrome
    chrome.storage.sync.set({address: wallet.address}, () => {
        chrome.storage.sync.set({secret: wallet.secret}, () => {

            // Log In
            checkAccount(wallet.address);
        });
    });
}

function loadExistingWallet(){
    $('.sign-in-screen').hide()
    $('.import-screen').show()
}

function importAcccount(){
    
    $('.import-screen').hide();

    let address = $('.input_address').val();
    let secret  = $('.input_secret').val();
    
    chrome.storage.sync.set({address: address}, () => {});
    chrome.storage.sync.set({secret: secret}, () => {
        checkAccount(address);
    });
}

function cancelLoading(){
    $('.sign-in-screen').show()
    $('.import-screen').hide()
}

function checkAccount(address){

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

function loadTransactions(_address){
    console.log('loading transactions for: ', _address)

    return api.getTransactions(_address).then(transaction => {
        $('.history-screen').show();

        for (let index = 0; index < transaction.length; index++) {
            const element = transaction[index];
            let newwe = $('.history-screen').find('.history-template').clone().removeClass('history-template');
            console.log(element.address , _address)
            if (element.address != _address) {
                console.log('matches')
                $(newwe).find('.amount').parent().addClass('text-success').removeClass('text-danger')
                $(newwe).find('.tofro').html('from:')
            }
            $(newwe).find('.amount').html(element.outcome.deliveredAmount.value)
            $(newwe).find('.address').html(element.specification.destination.address.substring(0,16)+'...').attr('title',element.specification.destination.address)
            $('.history-screen').append(newwe)
        }
        $('.history-screen').find('.history-template').hide();;
        console.log(transaction)
      });

}

function toggleDepositScreen(toggle){
    if (toggle == 1){
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
function toggleSendScreen(toggle){
    if (toggle == 1){
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

function init(){
    // Connect to API
    const server = 'wss://ws03.casinocoin.org:4443';
    api = new casinocoin.CasinocoinAPI({server:server});
    api.connect().then(function(a){
        console.log('Connected to CasinoCoin Server: ', server);
        // Does the user have a wallet
        chrome.storage.sync.get(['address'], function(result) {
            if(result.address != undefined && result.address != null){
                console.log('Wallet found in Storage: ', result.address);
                checkAccount(result.address);
            }
            else {
                console.log('No Wallet found in Storage');
                $('.sign-in-screen').show()
            };
    });
    });

    // Set up Event Listeners 
    document.getElementById("createAccount").addEventListener("click", createNewWallet);
    document.getElementById("importAccount").addEventListener("click", loadExistingWallet);
    document.getElementById("cancelLoad").addEventListener("click", cancelLoading);
    document.getElementById("submitLoad").addEventListener("click", importAcccount);
    document.getElementById("depositFunds").addEventListener("click", toggleDepositScreen);
    document.getElementById("sendFunds").addEventListener("click", toggleSendScreen);
    document.getElementById("exitDepositFunds").addEventListener("click", function(){toggleDepositScreen(1)});
    $('.closeSend').click( function(){toggleSendScreen(1)});
    $('.account-badge').click(copyAccountToClipboard)
    $('.more-options').click(toggleMoreOptions)
    $('.logOut').click(logOut)
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
      console.log('logging out')
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

const screens = ['.sign-in-screen', '.history-screen', '.main-screen', '.send-screen', '.deposit-screen', '.spinner-screen'];
function hideAllScreens(){
    for (let index = 0; index < screens.length; index++) {
        const element = screens[index];
        $(element).hide();
    }
}