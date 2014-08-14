var io = require('socket.io-client');

function SocketEventClient (serverHost, clientId) {
	this.clientId = clientId;
	this.eventDic = new Object();

	this.sckOption = {
		connected : false,
		connecting : false,
	};

	var options = {
		'max reconnection attempts' : 3
		, 'reconnect' : false
		, redoTransports : true
	};

	this.sckClient = io.connect(serverHost, options);
	this.sckOption.connecting = true;

	this.sckClient.on('connect', function(arg1, arg2){
		console.log('++++++++++++++++++++++++++++++++++++已连接上');
		this.sckOption.connecting = false;
		this.sckOption.connected = true;
		this.reSubscribeEvents();
	}.bind(this));

	this.sckClient.on('connect_failed', function(arg1, arg2){
		console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!连接失败');
		this.sckOption.connected = false;
		//this.sckClient.socket.reconnect();
		this.reconnect();
	}.bind(this));

	this.sckClient.on('reconnect_failed', function(arg1, arg2){
		console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!reconnect_failed');
	}.bind(this));

	this.sckClient.on('close', function(){
		console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!连接Close');
	});

	this.sckClient.on('disconnect', function(){
		// this.sckClient.connect(function(){
		// 	this.reSubscribeEvents();
		// }.bind(this));

		//this.reconnect();
		this.maybeReconnect();
		//while()
		//this.sckClient.socket.reconnect();
		// if(this.sckClient.socket.connecting == false 
		// 	&& this.sckClient.socket.reconnection == false 
		// 	&& this.sckClient.socket.connected == false){
		// 	this.sckClient.socket.reconnect();
		// };


	//this.reSubscribeEvents();
	}.bind(this));
};

SocketEventClient.prototype.reconnect = function(){
	// function reConn (){
	// 	this.sckClient.socket.reconnect();
	// }.bind(this);

	if(this.sckClient.socket.connecting == false 
		&& this.sckClient.socket.connecting == false 
		&& this.sckClient.socket.reconnecting == false
		&& this.sckClient.socket.connected == false){
		this.sckClient.socket.reconnect();
		setTimeout(this.reconnect.bind(this), 5 * 1000);
	}
	else{
		return;
	}
};

SocketEventClient.prototype.maybeReconnect =function() {
	var self = this.sckClient.socket;

	if (self.connected || self.reconnecting) {
		return;
	};

	if (self.connecting && self.reconnecting) {
		return self.reconnectionTimer = setTimeout(maybeReconnect.bind(this), 1 * 1000);
	}

	self.connect();
	self.publish('reconnecting', 500, 3);
	self.reconnectionTimer = setTimeout(this.maybeReconnect.bind(this), 1 * 1000);

	// if (self.reconnectionAttempts++ >= maxAttempts) {
	// 	if (!self.redoTransports) {
	// 		self.on('connect_failed', maybeReconnect);
	// 		self.options['try multiple transports'] = true;
	// 		self.transports = self.origTransports;
	// 		self.transport = self.getTransport();
	// 		self.redoTransports = true;
	// 		self.connect();
	// 	} else {
	// 	  	self.publish('reconnect_failed');
	// 	  	reset();
	// 	}
	// } else {
	// 	// if (self.reconnectionDelay < limit) {
	// 	//   	self.reconnectionDelay *= 2; // exponential back off
	// 	// }

	// 	self.connect();
	// 	self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
	// 	self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
	// }
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