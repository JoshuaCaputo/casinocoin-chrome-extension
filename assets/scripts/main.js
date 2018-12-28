function createNewWallet(){
    wallet = api.generateAddress();
    chrome.storage.sync.set({address: wallet.address}, () => {});
    chrome.storage.sync.set({secret: wallet.secret}, () => {
        checkAccount(wallet.address)
    });

    $('.sign-in-screen').hide()
    $('.spinner-title').html('Creating Your Wallet...')
    $('.spinner-desc').html('This only takes a second or two.');
}

function loadExistingWallet(){
    
    $('.sign-in-screen').hide()
    $('.import-screen').show()
}

function importAcccount(){

    
    $('.import-screen').hide()
    $('.spinner-title').html('Importing Your Wallet...')
    $('.spinner-desc').html('This only takes a second or two.');

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
        console.log("accountInfo", info);
        $('.csc-balance').html(info.cscBalance)
        $(".account-badge").popover({
            content: '<span class="copy">click to copy account address</span>',
            html:  true,
            trigger: 'hover',
            placement: 'top'
        }); 
        handleOutcome(); 
    }).catch(error => {
        console.log(error);
        if (error.message == "actNotFound"){
            $('.account-badge').addClass('badge-warning')    
            $(".account-badge").popover({
                title: 'Account Disabled',
                content: 'deposit funds to activate this account',
                html: false,
                trigger: 'hover',
                placement: 'top'
            }); 
        }
        handleOutcome();
    })
}

function init(){
    // Connect to API
    api = new casinocoin.CasinocoinAPI({server:'wss://ws01.casinocoin.org:4443'});
    api.connect().then(function(){
        
        console.log('connected');
        // Does the user have a wallet
        chrome.storage.sync.get(['address'], function(result) {
            if(result.address != undefined && result.address != null){

                checkAccount(result.address)
                
            }
            else {

                $('.sign-in-screen').show()

            };
    });
    });

    // Set up Event Listeners 
    document.getElementById("createAccount").addEventListener("click", createNewWallet);
    document.getElementById("importAccount").addEventListener("click", loadExistingWallet);
    document.getElementById("cancelLoad").addEventListener("click", cancelLoading);
    document.getElementById("submitLoad").addEventListener("click", importAcccount);
    $('.account-badge').click(e => {
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
    })
    
}
$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
    init()
  });