var SocketEventClient = require("./libs/socketEventClient").SocketEventClient;

//var client = new SocketEventClient('http://127.0.0.1:2900/', 'WzdClient_Node');
var client = new SocketEventClient('http://192.168.1.112:2900/', 'WzdClient_Node');


client.subscribe('PriceChanged', priceChangedHandler, operationCallback);
client.subscribe('PublishSalesState', publishSalesStateHandler, operationCallback);
client.enqueue('PriceChanged', 1, 60, { 'ListingSku' : '5100444'}, operationCallback);

function priceChangedHandler(arg){
	console.log('--------------------------------------The price of Sku【' + arg.ListingSku + '】 changed! It would be handled then.');
};

function publishSalesStateHandler(arg){
	console.log('-----------+++++++++++++++-------------The salesState of Sku【' + arg.ListingSku + '】 changed! It would be handled then.');
};

function operationCallback(result){
	console.log('+++++++++++++++++++++++++++++++++++操作结果为：' + JSON.stringify(result));
};