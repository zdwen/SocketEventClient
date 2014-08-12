var io = require('socket.io-client');

function SocketEventClient (serverHost, clientId) {
	this.clientId = clientId;
	this.eventDic = new Object();

	this.socket = io.connect(serverHost);

	this.socket.on('connect', function(arg1, arg2){
		console.log('++++++++++++++++++++++++++++++++++++已连接上');
	}.bind(this));

	this.socket.on('connect_failed', function(arg1, arg2){

	}.bind(this));

	this.socket.on('disconnect', function(){
		this.reSubscribeEvents();
	}.bind(this));
};

SocketEventClient.prototype.subscribe = function (eventName, eventArrivedCallback, operationCallback) {
	console.log('已开始订阅事件:', eventName);
	var subscribeResult = {
		'evant' : eventName,
		'operation' : 'subscribe'
	};

	if(Object.keys(this.eventDic).indexOf(eventName) >= 0){
		subscribeResult.status = 'ALREADY_SUBSCRIBED';

		return operationCallback(subscribeResult);
	};

	var arg = {
		'event' : eventName,
		'senderId' : this.clientId,
		'requestId' : this.genGuid()
	};
	
	this.socket.removeAllListeners(eventName);
	this.socket.on(eventName, function(msg){
		return eventArrivedCallback(msg.args);
	});

	this.socket.emit('subscribe', arg, function(emitResult){
		subscribeResult.status = emitResult.status;

		if(emitResult.status == 'SUCCESS')
			this.eventDic[eventName] = eventArrivedCallback;

		return operationCallback(subscribeResult);
	}.bind(this));
};

SocketEventClient.prototype.enqueue = function (eventName, tryTimes, timeout, params, operationCallback) {
	console.log('已开始推送事件:', eventName);
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

SocketEventClient.prototype.reSubscribeEvent = function(eventName, eventArrivedCallback){
	var arg = {
		'event' : eventName,
		'senderId' : this.clientId,
		'requestId' : this.genGuid()
	};

	this.socket.removeAllListeners(eventName);
	this.socket.on(eventName, function(msg){
		return eventArrivedCallback(msg.args);
	});

	this.socket.emit('subscribe', arg, function(emitResult){
		console.log('重新订阅成功，事件:', eventName);
		return;
	}.bind(this));
};

SocketEventClient.prototype.reSubscribeEvents = function(){
	var callbacks = Object.keys(this.eventDic);

	callbacks.forEach(function(eventName){
		this.reSubscribeEvent(eventName, this.eventDic[eventName]);
	}.bind(this));
};

SocketEventClient.prototype.genGuid = function() {
    var S4 = function() { 
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }; 

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); 
};

exports.SocketEventClient = SocketEventClient;