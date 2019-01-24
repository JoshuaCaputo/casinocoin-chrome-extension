
        
        document.body.onload = () => {
    $('[data-view="menu-bar"]').load('assets/views/notification-bar.html', () => {
        
    });
    PaymentScreenController.load();
}


var PaymentScreenController = new function(){
    let scope = this;
    this.load = (options) => {
        $('[data-view="payment-screen"]').load('assets/views/payment-screen.html', () => {
            $('#paymentButton').click(scope.toggleMoreSettings);
            $('.btn-dismiss').click(chrome.extension.getBackgroundPage().extension.NotificationManager.closeNotification)
            function readyConfirm(){
              let data =  {
                    description:$('#paymentDescription').val(),
                    tag:$('#paymentTag').val()
                }
                
                chrome.extension.getBackgroundPage().extension.NotificationManager.confirmNotification(data);

            }
            $('.btn-confirm').click(readyConfirm)
        });
    };

    this.presentPayment = (info) => {
        chrome.extension.getBackgroundPage().extension.WalletManager.walletInStorage().then(function(wallet){
            scope.loadIdenticons(wallet.address, info.recipient)
        })
        $('#paymentAmount').html(info.amount);
        if (info.description || info.tag){
            scope.toggleMoreSettings();
            if (info.description) {
                $('#paymentDescription').attr('disabled', true);
            }
            if (info.tag) {
                $('#paymentTag').attr('disabled', true);
            }
        }
        $('#paymentDescription').val(info.description);
        $('#paymentTag').val(info.tag);
    }

    this.toggleMoreSettings = (e) => {
        $('#moreSettings').slideToggle('fast', function(){
            if ($('#moreSettings').is(':visible')){
                $('#paymentButton').html('basic settings');
                return;
            }
            $('#paymentButton').html('advanced settings');
        });
    }

    this.fetchIdenticonForName = (hash) => {
        if (!hash) hash = '';
        let data = new Identicon(hash.padStart('d3b07384d113edec49eaa6238ad5ff00'.length,'*')).toString();
        return ('data:image/png;base64,' + data + ''); 
    }

    this.loadIdenticons = (account1, account2) => {
        let identicons = [scope.fetchIdenticonForName(account1), scope.fetchIdenticonForName(account2)];
        $('.identicon1').attr('src', identicons[0]);
        $('.identicon2').attr('src', identicons[1]);
        $('.address1').html(account1)
        $('.address2').html(account2)
    };
}