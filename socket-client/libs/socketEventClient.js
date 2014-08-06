var io = require('socket.io-client');

function SocketEventClient (serverHost, clientId) {
	this.socket = io.connect(serverHost);
	this.clientId = clientId;
};

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