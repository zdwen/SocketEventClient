## SocketEventClient ##

**SocketEventClient** is the wrapper over socket.io-client of communication with the SocketEvent. An advanced Node.js client against an advanced socket.io server named SocketEvent.

### How to use ###

- npm install

``` command
npm i socket.event-client
```

- Construct and connect to a socket.io server automatically.

```JavaScript
var SocketEventClient = require('socket.event-client').SocketEventClient;
var client = new SocketEventClient('http://192.168.1.112:2900/', 'WzdClient_Node');
```

- Subscribe some event named specified.

```JavaScript
client.subscribe('PriceChanged', priceChangedHandler, operationCallback2); 
client.subscribe('PublishSalesState', publishSalesStateHandler, operationCallback);
```

- Enqueue some event named specified.

``` JavaScript
client.enqueue('PriceChanged', 1, 60, { 'ListingSku' : '5100444'}, operationCallback);
```

- And the details of the callbacks.

``` JavaScript
function priceChangedHandler(arg){ 
	console.log('--------------------------------------The price of Sku【' + arg.ListingSku + '】 changed! It would be handled then.'); 
};
function publishSalesStateHandler(arg){ 
	console.log('-----------+++++++++++++++-------------The salesState of Sku【' + arg.ListingSku + '】 changed! It would be handled then.'); 
};
function operationCallback(result){ 
	console.log('+++++++++++++++++++++++++++++++++++操作结果为：' + JSON.stringify(result)); 
};

function operationCallback2(result){ 
	console.log('+++++++++++++++++++++++++++++++++++操作结果为：' + JSON.stringify(result)); 
	client.subscribe('PriceChanged', priceChangedHandler, operationCallback); 
};
```

If you need to watch the result of execution directly, pls pull the souce code of the latest version and run "node demo1.js" in your node.js context——of course, you should be sure that your SocketEvent server is running normally meanwhile.
