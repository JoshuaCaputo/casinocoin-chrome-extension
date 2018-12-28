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

    function handleOutcome(){
        $('.account_address').html(address);
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
    $('.account-badge').click(copyAccountToClipboard)
}

function copyAccountToClipboard(e){
        console.log(e.target.innerHTML)
        function copyToClipboard(element) {
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($(element).text()).select();
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