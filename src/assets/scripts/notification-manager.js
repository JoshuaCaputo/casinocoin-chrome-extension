// @dev A collection of methods for controlling the showing and hiding of the notification popup.
// @author Joshua Caputo
// @date 01/23/19

let NotificationManager = function() {
    let scope = this;
  
    this.notification_url = "notification.html";
    this.open = false;

    // @dev Either returns false, or returns the notification for provided id
    this.checkForNotification = (id, callback) => {
        chrome.windows.get(id, {}, function(a){
            if (a) callback(a);
            
            if(chrome.runtime.lastError){
                scope.notification_id = undefined;
                scope.notification_window = undefined;
                scope.showNotification();
            }
        },)
    }

    // @dev Bring the notification into view
    this.bringNotificationToFront = () => {
        chrome.windows.update(scope.notification_window.id, {focused:true});
        scope.open = true;
    }

    // @dev Reloads new notification window
    this.reloadNotification = (_options, callback) => {
        let popup =  scope.getNotification();
        popup.PaymentScreenController.presentPayment(_options);

        scope.bringNotificationToFront();
        
        if (callback) callback();
    }

    // @dev Fires callback() when complete, Check is window DOM has loaded
    this.onWindowLoaded = (id, _options ,callback) => {
        chrome.tabs.getSelected(id,  function (r){
        if (r.status == 'loading'){
            setTimeout(() => {
              scope.onWindowLoaded(id, _options ,callback)
            }, 50);
        }
        else {
            callback(_options);
            }
        })
    }

    // @dev Creates a new notification window
    this.createNotification = (_options, callback) => {
        if (!callback) callback = function(){}
        chrome.windows.create({url:scope.notification_url, focused:true, type:'popup', width:360, height:600}, function(window, wi){
            scope.notification_id = window.tabs[0].id;
            scope.notification_window = window;
            console.log('Notification Created :', window.tabs[0].id);
    
            scope.onWindowLoaded(window.id, _options, function(_options){
                scope.reloadNotification(_options, callback);
            });
          });
    }
  
    // @dev Either brings an existing CasinoCoin notification into focus, or create a new notification window.
    this.showNotification = (_options, callback) => {
        if (!callback) callback = function(){}
        scope.notification_options = _options;
        if (scope.getNotification()){
            scope.checkForNotification(scope.notification_window.id, function(result){
                if (result) scope.reloadNotification(_options, callback);
                else scope.createNotification(_options, callback);
            });
        }
        else { scope.createNotification(_options, callback); }
    };
  
    // @dev Close a CasinoCoin notification, if it exists.
    this.closeNotification = () => { 
        console.log('Notification Closed :', scope.notification_window.tabs[0].id);
        chrome.windows.remove(scope.notification_window.id);
        scope.notification_window = undefined;
        scope.notification_id = undefined;
        scope.open = false;
    };

    this.confirmNotification = (data) => {
        console.log('Notification Confirmed :',scope.notification_window.tabs[0].id);
        if (scope.notification_options){
            WalletManager.secretInStorage().then(function(r){
                WalletManager.walletInStorage().then(function(rr){
                    let sender_secret = r.secret;
                    let sender_address = rr.address;
                    scope.notification_options.tag = data.tag;
                    scope.notification_options.description = data.description;
                    console.log('Notification Options :', scope.notification_options);
                    // Send Payment With Options
                    extension.CasinoCoinManager.preparePayment([sender_address, scope.notification_options.recipient,scope.notification_options.amount ], function(p){
                        let a = extension.CasinoCoinManager.sign(p, sender_secret)
                        console.log(a)
                        extension.CasinoCoinManager.submit(a, function(r){
                            console.log(r)
                        })
                    })
                    scope.closeNotification();
                })
            })
        }
    }
  
    // @dev Returns the first CasinoCoin notification, if any exist.
    this.getNotification = () => { 
        return chrome.extension.getViews({type:"tab"})[0];
    };
}