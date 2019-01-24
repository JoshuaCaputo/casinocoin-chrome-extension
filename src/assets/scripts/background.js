var extension = {};
extension.NotificationManager = new NotificationManager();
extension.CasinoCoinManager = new CasinoCoinManager();
extension.CasinoCoinManager.connect(function(){
    console.log('Connected to CasinoCoin API')
});

let WalletManager = new function(){
    let scope = this;
    this.walletInStorage = () => new Promise(resolve => chrome.storage.sync.get(['address'],resolve));
    this.secretInStorage = () => new Promise(resolve => chrome.storage.sync.get(['secret'],resolve));

    this.walletToStorage = (wallet, callback) => {
        chrome.storage.sync.set({address: wallet.address}, () => {
            chrome.storage.sync.set({secret: wallet.secret}, () => {
                if (callback) callback(true);
            });
        });
    };

    this.clearWalletFromStorage = (callback) => {
        chrome.storage.sync.set({address: null}, () => {
            chrome.storage.sync.set({secret: null}, () => {
                if (callback) callback(true);
            });
        });
    }

    return this;
}

extension.WalletManager = WalletManager;


// onInstalled
chrome.runtime.onInstalled.addListener(function() {
    console.log('Application Installed');
});

chrome.browserAction.onClicked.addListener(function(){
    console.log('tab opened', arguments[0]);
})


// onMessage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.command == 'popup_opened'){
        console.log('The popup has been opened by the user')
        return;
    }
      console.log('[Background] Message Received: ', request);
      extension.NotificationManager.showNotification(request.contents);
});


    function checkWallet(){
        
        // Does the user have a wallet
        chrome.storage.sync.get(['address'], function(result) {
            const _address = result.address;
            if(_address != undefined && _address != null){
                console.log('Wallet found in Storage:', _address);
                checkAccount(_address);
            }
            else {
                console.log('No Wallet found in Storage');
                //$('.sign-in-screen').show();
            };
        });
    }