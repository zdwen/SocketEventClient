var SocketEventClient = require("./lib/socketEventClient").SocketEventClient;

var client = new SocketEventClient('http://127.0.0.1:2900/', 'WzdClient_Node');

client.onSubscribeCompleted(subscribeHandler);
client.onEnqueueCompleted(enqueueHandler);
client.onConnectFailed(connectFailedHandler);
client.onInnerError(innerErrorHandler);
client.onEventArrived('PriceChanged', priceChangedHandler);
client.onEventArrived('PublishSalesState', publishSalesStateHandler);



setTimeout(doWork, 10*1000);

function doWork(){
	client.connect();

	client.subscribe('PriceChanged');
	client.subscribe('PublishSalesState');
	client.enqueue('PriceChanged', 1, 60, { 'ListingSku' : '5100444'});
};

console.log('启动完成');

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

