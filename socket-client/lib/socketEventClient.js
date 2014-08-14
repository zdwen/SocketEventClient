var io = require('socket.io-client');

function SocketEventClient (serverHost, clientId) {
	this.clientId = clientId;
	this.eventDic = new Object();

	var options = {
		'reconnect' : false
		, 'auto connect': true
	};

	this.sckClient = io.connect(serverHost, options);

	this.sckClient.on('connect', function(arg1, arg2){
		this.reSubscribeEvents();
	}.bind(this));

	this.sckClient.on('disconnect', function(){
		this.reconnect();
	}.bind(this));
};

SocketEventClient.prototype.reconnect = function() {
	var sct = this.sckClient.socket;

	if (sct.connected || sct.reconnecting)
		return;

	sct.connect();
	sct.publish('reconnecting');

	setTimeout(this.reconnect.bind(this), 1 * 1000);
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
	
	this.sckClient.removeAllListeners(eventName);
	this.sckClient.on(eventName, function(msg){
		return eventArrivedCallback(msg.args);
	});

	this.sckClient.emit('subscribe', arg, function(emitResult){
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

	this.sckClient.emit('enqueue', arg, function(result){
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

	this.sckClient.removeAllListeners(eventName);
	this.sckClient.on(eventName, function(msg){
		return eventArrivedCallback(msg.args);
	});

	this.sckClient.emit('subscribe', arg, function(emitResult){
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