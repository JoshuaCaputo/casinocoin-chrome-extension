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

function loadTransactions(_address){
    console.log('loading transactions for: ', _address)
    var part = $('.history-screen').find('.history-template').show();
    $('.history-screen').empty().append(part);
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


function importWallet(){
    
    if (!$('.input_address').hasClass('border-success')){
        $('.import-error-badge').html('invalid address format').show();
        return;
    }
    if (!$('.input_secret').hasClass('border-success')){
        $('.import-error-badge').html('invalid secret format').show();
        return;
    }

    $('.import-screen').hide();
    let address = $('.input_address').val();
    let secret  = $('.input_secret').val();
    
    chrome.storage.sync.set({address: address}, () => {});
    chrome.storage.sync.set({secret: secret}, () => {
        checkAccount(address);
    });
}

let WalletUtilities = {
    isValidAddress: (_address) => {
        return casinocoin.CasinocoinAddressCodec.isValidAddress(_address);
    },
    isValidSecret: (_secret) => {
        return casinocoin.CasinocoinAPI['_PRIVATE'].ledgerUtils.common.isValidSecret(_secret);
    }
}