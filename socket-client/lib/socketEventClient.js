var _io = require('socket.io-client');
var _events = require('events');
var _util = require("util");

function SocketEventClient (serverHost, clientId) {
	this.clientId = clientId;
	this.events = [];
	this.connectAttempts = 0;
	this.reconnectAttempts = 0;

	var options = {
		'reconnect' : false
		, 'auto connect': false
	};

	this.sckClient = _io.connect(serverHost, options);

	this.sckClient.on('connect', function(arg1, arg2){
		this.reSubscribeEvents();
	}.bind(this));

	this.sckClient.on('disconnect', function(){
		this.reconnect();
	}.bind(this));
};

_util.inherits(SocketEventClient, _events.EventEmitter);

SocketEventClient.prototype.connect = function() {
	if(this.connectAttempts++ > 60){
		this.emit('connect_failed');
		this.connectAttempts = 0;
		//return;TODO【闻祖东 2014-8-15-155646】恐怕这个地方不能return，一return就又整个退出了。
	}

	var sct = this.sckClient.socket;

	if (sct.reconnecting)
		return;

	if(sct.connected){
		this.emit('connect');
		return;
	}

	sct.connect();
	sct.publish('connecting');

	setTimeout(this.connect.bind(this), 1 * 1000);
};

SocketEventClient.prototype.reconnect = function() {
	if(this.reconnectAttempts++ > 60){
		this.emit('reconnect_failed');///TODO【闻祖东 2014-8-15-154855】重连失败的地方之后还需要将未Enqueue的数据告知调用方。
		this.reconnectAttempts = 0;
		//return;TODO【闻祖东 2014-8-15-155711】这个地方应该也不能return，否则就直接退出了。
	}

	var sct = this.sckClient.socket;

	if (sct.connected || sct.reconnecting){
		///TODO【闻祖东 2014-8-15-155017】这个地方需要测试是否不需要做ReEnqueue，SocketIOClient也会自己Enqueue。
		return;
	}

	sct.connect();
	sct.publish('reconnecting');

	setTimeout(this.reconnect.bind(this), 1 * 1000);
};

SocketEventClient.prototype.subscribe = function (eventName) {
	console.log('已开始订阅事件:', eventName);
	var subscribeResult = {
		'evant' : eventName,
		'operation' : 'subscribe'
	};

	var arg = {
		'event' : eventName,
		'senderId' : this.clientId,
		'requestId' : this.genGuid()
	};
	
	this.sckClient.removeAllListeners(eventName);
	this.sckClient.on(eventName, function(msg){
		this.emit(eventName, msg.args);
	}.bind(this));

	this.sckClient.emit('subscribe', arg, function(emitResult){
		subscribeResult.status = emitResult.status;

		this.emit('subscribe', subscribeResult);
	}.bind(this));
};

SocketEventClient.prototype.enqueue = function (eventName, tryTimes, timeout, params) {
	console.log('已开始推送事件(带operationCallback):', eventName);
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

		this.emit('enqueue', enqueueResult);
	}.bind(this));
};

SocketEventClient.prototype.genGuid = function() {
    var S4 = function() { 
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }; 

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); 
};

SocketEventClient.prototype.reSubscribeEvents = function(){
	var self = this;
	function subscribeOne(evtName){
		var arg = {
			'event' : evtName,
			'senderId' : self.clientId,
			'requestId' : self.genGuid()
		};

		self.sckClient.emit('subscribe', arg, function(emitResult){
			console.log('重新订阅成功，事件:', evtName);
			return;
		});
	};

	this.events.forEach(function(eventName){
		subscribeOne(eventName);
	});
};



SocketEventClient.prototype.onEventArrived = function(eventName, callback) {
	if(this.events.indexOf(eventName) < 0)
		this.events.push(eventName);

	this.addListener(eventName, callback);
	console.log('订阅事件' + eventName + '完成');
};

SocketEventClient.prototype.onSubscribeCompleted = function(callback){
	this.addListener('subscribe', callback);
	console.log('订阅操作事件添加完成');
};

SocketEventClient.prototype.onEnqueueCompleted = function(callback){
	this.addListener('enqueue', callback);
	console.log('推送操作事件添加完成');
};

SocketEventClient.prototype.onConnectFailed = function(callback){
	this.addListener('connect_failed', callback);
	console.log('连接失败事件添加完成');
};

SocketEventClient.prototype.onInnerError = function(callback){
	this.addListener('reconnect_failed', callback);
	console.log('重连失败(内部错误)事件添加完成');
};

exports.SocketEventClient = SocketEventClient;