
document.body.onload = () => {
    $('[data-view="menu-bar"]').load('assets/views/menu-bar.html', () => {

        // Get buttons in the menu-bar and setup listeners for clicks

        ViewManager.loadViews();

        checkForWallet()

    });
}


function checkForWallet(){
    chrome.extension.getBackgroundPage().extension.WalletManager.walletInStorage().then(function(result){
        let address=result.address;
        if (address!=null && address!=undefined){
            console.log('user has a wallet', address);
            ViewManager.showView(1);
            console.log(DashboardViewController)
        }
        else {
            console.log('user has no wallet');
            ViewManager.showView(0);
        }
    })
}

var ViewManager = new function(){
    let scope = this;
    this.views = [];
    this.currentView = undefined;

    this.loadViews = function(){
        scope.views.forEach(view => { view.load(); });
    }

    this.showView = function(view_id){

        let arrangements = [[1,7], [0], [2], [3], [4], [5], [6], [7]];

        for (let index = 0; index < scope.views.length; index++) {
            if (arrangements[view_id].includes(index)) continue;
            const element = scope.views[index];
            element.hide();
            
        }

        arrangements[view_id].forEach(id => {
            scope.views[id].show();
            if (scope.views[id].update) {
                scope.views[id].update();
            }
        });
    }
    return this;
}


class ViewController {
    constructor(data_view){
        this.view = data_view;
        ViewManager.views.push(this);
    }
    load() {
        $('[data-view="'+this.view+'"]').load('assets/views/'+this.view+'.html',() => {}).hide();
    }
    toggle() {
        $('[data-view="'+this.view+'"]').fadeToggle(arguments[0]);
    }
    show() {
        $('[data-view="'+this.view+'"]').fadeIn(arguments[0]);
    }
    hide() {
        $('[data-view="'+this.view+'"]').fadeOut(0);
    }
}

class SpinnerScreenViewController extends ViewController {
    constructor(data_view){
        super(data_view);
        this.titleElemet = '.spinner-title'
        this.descriptionElement = '.spinner-desc';
    }
    changeTitle(){ $(this.titleElemet).html(arguments[0]) }
    changeDescription(){ $(this.descriptionElement).html(arguments[0]) }
    update(){
        this.changeTitle(arguments[0]);
        this.changeDescription(arguments[1]);
    }
}

class ConfirmDismissViewController extends ViewController {
    constructor(data_view){
        super(data_view);
    }
    load(){
        $('[data-view="'+this.view+'"]').load('assets/views/'+this.view+'.html',() => {
            let scope = this;
            $('[data-view="'+this.view+'"] .btn-confirm').on('click', event => { scope.confirm() })
            $('[data-view="'+this.view+'"] .btn-dismiss').on('click', event => { scope.dismiss() })
        }).hide();
    }
    confirm(){
        $('[data-view="'+this.view+'"]').fadeOut();
        if (this.onConfirm != undefined){
            this.onConfirm('onConfirm triggered by .confirm()')
        }
    }
    dismiss(){
        $('[data-view="'+this.view+'"]').fadeOut();
        if(this.onDismiss){
            this.onDismiss('onDismiss triggered by .dismiss()')
        }
    }
}

var DashboardViewController = new ConfirmDismissViewController('main-screen')
DashboardViewController.update = function(){
    // show account address
    chrome.extension.getBackgroundPage().extension.WalletManager.walletInStorage().then(result=>{
        let address=result.address;
        let scope = this;
        $('[data-view="'+this.view+'"]').find('.account-address').html(address);
        
        // show account balance
        chrome.extension.getBackgroundPage().extension.CasinoCoinManager.getAccountInfo(address, function(info){
            if (info != false){ 
                console.log(info)
                $('[data-view="'+scope.view+'"]').find('.account-balance').html(info.cscBalance.substr(0,13));
                // show account history
            }
            else { console.log(info) }
            
            })
    })
}
DashboardViewController.confirm = function(){
    ViewManager.showView(3)
};
DashboardViewController.dismiss = function(){
    ViewManager.showView(2)
};
var LoginScreenController = new ConfirmDismissViewController('login-screen')
LoginScreenController.confirm = function(){
    // Generate New Wallet -> Then Present Dashboard
    chrome.extension.getBackgroundPage().extension.CasinoCoinManager.getNewWallet(function(wallet){
        chrome.extension.getBackgroundPage().extension.WalletManager.walletToStorage(wallet, function(response){
            if (response == true){
                console.log('Wallet Created');
                checkForWallet();
            }
        })
    })
};
LoginScreenController.dismiss = function(){
    ViewManager.showView(4)
};
var DepositScreenController = new ConfirmDismissViewController('deposit-screen')

DepositScreenController.load = function(){

    $('[data-view="'+this.view+'"]').load('assets/views/'+this.view+'.html',() => {
        let scope = this;
        chrome.extension.getBackgroundPage().extension.WalletManager.walletInStorage().then(function(wallet){
            let address = wallet.address;
            $('[data-view="'+scope.view+'"] .btn-confirm').on('click', event => { scope.confirm() })
            $('[data-view="'+scope.view+'"] .input-address').val(address)
            $('[data-view="'+scope.view+'"] #qr').empty()
            var qrcode = new QRCode("qr", {
                text: address,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            $('[data-view="'+scope.view+'"] #qr').find('img').addClass('m-auto');
    })
    }).hide();
}
DepositScreenController.confirm = function(){
    ViewManager.showView(1)
};
var SendScreenController = new ConfirmDismissViewController('send-screen');

SendScreenController.dismiss = DepositScreenController.confirm;
SendScreenController.load = function(){

    $('[data-view="'+this.view+'"]').load('assets/views/'+this.view+'.html',() => {
        let scope = this;
        $('[data-view="'+this.view+'"] .btn-confirm').on('click', event => { scope.confirm() })
        $('[data-view="'+this.view+'"] .btn-dismiss').on('click', event => { scope.dismiss() })
        $('[data-view="'+this.view+'"] .btn-toggle').on('click', event => { 
            $('[data-view="'+this.view+'"] .data-toggle').slideToggle(function(a){
                let element = $('[data-view="'+this.view+'"] .data-toggle');
                $('[data-view="'+scope.view+'"] .btn-toggle').html('advanced settings')
                if ($('[data-view="'+scope.view+'"] .data-toggle').is(":visible")){
                    $('[data-view="'+scope.view+'"] .btn-toggle').html('basic settings')
                }
            });
        })
    }).hide();
}
SendScreenController.confirm = function(){
    // Prepare Notification for Verification
    let scope = this;
    chrome.extension.getBackgroundPage().extension.WalletManager.walletInStorage().then(function(result){
        let formData = {
            tag: $('[data-view="'+scope.view+'"] input[name="tag"]').val(),
            sender: result.address,
            recipient: $('[data-view="'+scope.view+'"] input[name="address"]').val(),
            description: $('[data-view="'+scope.view+'"] input[name="description"]').val(),
            amount: $('[data-view="'+scope.view+'"] input[name="amount"]').val(),
        }
        
        chrome.extension.getBackgroundPage().extension.NotificationManager.showNotification(formData, function(){
            console.log('notification opened');
        
    
            let checker = setInterval(() => {
                console.log('checking for notification to be closed')
                if (chrome.extension.getBackgroundPage().extension.NotificationManager.open !=true) {
                    clearInterval(checker)
                    ViewManager.showView(1);
                }
            }, 1000);
        });
    })

    ViewManager.showView(7);
    SpinnerScreenController.update('Hold \'Em','Please verify your payment')
    
}

var ImportScreenController = new ConfirmDismissViewController('import-screen')
ImportScreenController.confirm = function(){
    // @2do Import Wallet -> Then Present Dashboard
};
ImportScreenController.dismiss = function(){
    ViewManager.showView(0)
};

var AboutScreenController = new ConfirmDismissViewController('about-screen')
var SettingsScreenController = new ConfirmDismissViewController('settings-screen')
SettingsScreenController.onConfirm = function(){
    console.log(arguments[0])
};

var SpinnerScreenController = new SpinnerScreenViewController('spinner-screen')