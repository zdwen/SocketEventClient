var io = require('socket.io-client');

function SocketEventClient (serverHost, clientId) {
	this.socket = io.connect(serverHost);
	this.clientId = clientId;
};

// TODO: 考虑各种异常情况下（特别是网络异常）程序能够保证处于正确状态。比如如果程序退出，如何切断与服务器的连接？
// TODO: 保存当时状态，重新连接时使用
SocketEventClient.prototype.subscribe = function (eventName, eventArrivedCallback, operationCallback) {
	var arg = {
		'event' : eventName,
		'senderId' : this.clientId,
		'requestId' : this.genGuid()
	};
	
	this.socket.on(eventName, function(msg){
		eventArrivedCallback(msg.args);
	});

	this.socket.emit('subscribe', arg, function(emitResult){
		var subscribeResult = {
			'evant' : eventName,
			'status' : emitResult.status,
			'operation' : 'subscribe'
		};

		operationCallback(subscribeResult);
	});
};

SocketEventClient.prototype.enqueue = function (eventName, tryTimes, timeout, params, operationCallback) {
	var arg = {
		'event' : eventName,
		'senderId' : this.clientId,
		'requestId' : this.genGuid(),
		'tryTimes' : tryTimes,
		'timeout' : timeout,
		'args' : params
	};

	this.socket.emit('enqueue', arg, function(result){
		var enqueueResult = {
			'event' : eventName,
			'status' : result.status,
			'operation' : 'enqueue'
		};

		operationCallback(enqueueResult);
	});
};


SocketEventClient.prototype.genGuid = function() {
    var S4 = function() { 
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }; 

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); 
};

exports.SocketEventClient = SocketEventClient;