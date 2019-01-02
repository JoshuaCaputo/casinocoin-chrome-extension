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


function importWallet(){
    
    $('.import-screen').hide();

    let address = $('.input_address').val();
    let secret  = $('.input_secret').val();
    
    chrome.storage.sync.set({address: address}, () => {});
    chrome.storage.sync.set({secret: secret}, () => {
        checkAccount(address);
    });
}