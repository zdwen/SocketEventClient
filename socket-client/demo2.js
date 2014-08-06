var SocketEventClient = require("./libs/socketEventClient2").SocketEventClient;

var client = new SocketEventClient('http://127.0.0.1:2900/', 'WzdClient_Node');
//var client = new SocketEventClient('http://192.168.1.112:2900/', 'WzdClient_Node');


client.onEventArrived('PriceChanged', businessArrived);
client.subscribe('PriceChanged', operationCallback);

//client.subscribe('PublishSalesState', publishSalesStateHandler, operationCallback);
//client.enqueue('PriceChanged', 1, 60, { 'ListingSku' : '5100444'}, operationCallback);


// function businessArrived(bizName, args){
// 	console.log('业务【' + bizName + '】到达，具体参数为：【' + JSON.stringify(args) + '】');
// };

function businessArrived(args){
	console.log('业务到达，具体参数为：【' + JSON.stringify(args) + '】');
};

function operationCallback(result){
	console.log('+++++++++++++++++++++++++++++++++++操作结果为：' + JSON.stringify(result));
};