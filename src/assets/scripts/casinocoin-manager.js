// @dev A collection of methods for interacting with the CasinoCoin Ledger.
// @author Joshua Caputo
// @date 01/23/19

let CasinoCoinManager = function() {
    let scope = this;
  
    this.server_url = "wss://ws03.casinocoin.org:4443";
    this.api = undefined;
    
    // @dev Connects background script to CasinoCoin Server, then returns in callback
    this.connect = callback => {
        scope.api = new casinocoin.CasinocoinAPI({server:scope.server_url});
        scope.api.connect().then(callback)
    }

    // @dev Lookup a new CasinoCoin Address, returns info to callback if account is activated/exists
    //      otherwise, check if account is not activated or if there is some error
    this.getAccountInfo = (address, callback) => {
        scope.api.getAccountInfo(address).then(info => {
            callback(info);
        }).catch(error => {
            if (error.message == "actNotFound"){ callback(false); }
            else { callback("error") }
        })
    }

    // @dev Create a new CasinoCoin Address, returns it to callback
    this.getNewWallet = callback => {
        callback(scope.api.generateAddress());
    }

    // @dev Returns a prepared payment to the callback
    // @doc https://casinocoin.org/build/reference-casinocoinapi.html#preparepayment
    // @arg (address: string, payment: Object, instructions: Object)
    // @ret Promise<Object>
    this.preparePayment = (args, callback) => {
        const address2= args[0];
        const payment3 = extension.CasinoCoinManager.getPaymentInfo(address2, args[1], args[2])
        extension.CasinoCoinManager.api.preparePayment(address2, payment3).then(prepared => {
            console.log(prepared)
            if (callback) callback(prepared);
        });
    }
    // @dev Signs a prepared payment, returns a signed transaction
    // @doc https://casinocoin.org/build/reference-casinocoinapi.html#sign
    // @arg (txJSON: string, secret: string, options: Object)
    // @ret {signedTransaction: string, id: string}
    this.sign = (prepared, _secret) => {
        const signedTransaction = ( extension.CasinoCoinManager.api.sign(prepared.txJSON, _secret));
        return signedTransaction;
    }
    // @dev Returns a prepared payment to the callback
    // @doc https://casinocoin.org/build/reference-casinocoinapi.html#submit
    // @arg (signedTransaction: string)
    // @ret Promise<Object>
    this.submit = (signedTransaction, callback) => {
        extension.CasinoCoinManager.api.submit(signedTransaction.signedTransaction)
        .then(result => {
            console.log(result)
            if (callback) callback(result);
        });
    }

    // @dev Beautify this syntax
    this.getPaymentInfo = function(from_address, to_address, amount_to_send){
        return {
            "source": {
                "address": from_address,
                "maxAmount": {
                "value": amount_to_send,
                "currency": "CSC",
                "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
                }
            },
            "destination": {
                "address": to_address,
                "amount": {
                "value": amount_to_send,
                "currency": "CSC",
                "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
                }
            }
        };
    }
}