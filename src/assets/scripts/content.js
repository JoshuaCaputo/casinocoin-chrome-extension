console.log('CasinoCoin Chrome Extension v1');
var port = chrome.runtime.connect();


window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;


    // The Message is from WebFelt
    if (event.data.type && (event.data.type == "WebFelt")) {
        // Respond to WebFelt
        console.log(event.data)
        window.postMessage({ type: "FROM_EXTENSION", value: 1 }, "*");
        
        // Send Message to Background
        chrome.runtime.sendMessage(event.data, function(response) {});
    }
    
}, false);