## SocketEventClient ##

**SocketEventClient** is the wrapper over socket.io-client of communication with the SocketEvent. An advanced Node.js client against an advanced socket.io server named SocketEvent.

### How to use ###

- npm install

``` command
npm i socket.event-client@0.2.0
```

- Construct and connect to a socket.io server automatically.

```JavaScript
var SocketEventClient = require('socket.event-client').SocketEventClient;
var client = new SocketEventClient('http://192.168.1.112:2900/', 'WzdClient_Node');
```

- Register some system events.
``` JavaScript
client.onSubscribeCompleted(subscribeHandler);
client.onEnqueueCompleted(enqueueHandler);
client.onConnectFailed(connectFailedHandler);
client.onInnerError(innerErrorHandler);
```

- Register some business events.
``` JavaScript
client.onEventArrived('PriceChanged', priceChangedHandler);
client.onEventArrived('PublishSalesState', publishSalesStateHandler);
...
```

- Connect the SocketEvent Server and do the Business Operations.
``` JavaScript
client.connect();

client.subscribe('PriceChanged');
client.subscribe('PublishSalesState');
client.enqueue('PriceChanged', 1, 60, { 'ListingSku' : '5100444'});
...
```

- And the details of the callbacks.

``` JavaScript
function subscribeHandler(eventName){
	console.log('----------------订阅事件成功:', eventName);
};

function enqueueHandler(eventName){
	console.log('----------------推送事件成功:', eventName);
};

function connectFailedHandler(){
	console.log('----------------初始化连接失败，理论上调用方应该在接收到这个事件之后不再做任何Subscribe或Enqueue操作');
};

function innerErrorHandler(){
	console.log('----------------内部错误，理论上调用方应该在接收到这个事件之后不再做任何Subscribe或Enqueue操作');
};



function priceChangedHandler(arg){
	console.log('--------------------------------------The price of Sku【' + arg.ListingSku + '】 changed! It would be handled then.');
};

function publishSalesStateHandler(arg){
	console.log('-----------+++++++++++++++-------------The salesState of Sku【' + arg.ListingSku + '】 changed! It would be handled then.');
};
```

If you need to watch the result of execution directly, pls pull the souce code of the latest version and run "node demo1.js" in your node.js context——of course, you should be sure that your SocketEvent server is running normally meanwhile.
