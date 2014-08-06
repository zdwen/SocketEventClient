var io = require('socket.io-client');
var events = require('events');
var util = require("util");

///【闻祖东 2014-8-6-172320】Ref2：http://nodejs.org/api/events.html#events_events

function eventAgent(){
	events.EventEmitter.call(this);
};

util.inherits(eventAgent, events.EventEmitter);

function SocketEventClient (serverHost, clientId) {
	this.socket = io.connect(serverHost);
	this.clientId = clientId;
	this.subscribeEvents = [];
	this.listener = [];
	//this.eventEmitter = new events.EventEmitter();
	this.eventAgent = new eventAgent();
};



SocketEventClient.prototype.subscribe = function (eventName, operationCallback) {
	var arg = {
		'event' : eventName,
		'senderId' : this.clientId,
		'requestId' : this.genGuid()
	};
	
	this.socket.on(eventName, function(msg){
		//this.eventEmitter.emit(eventName, msg.args);
		///TODO【闻祖东 2014-8-6-182047】总是会在这个地方报错提示“TypeError: Cannot call method 'emit' of undefined”
		this.eventAgent.emit(eventName, msg.args); 
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

SocketEventClient.prototype.enqueue = function (eventName, tryTimes, timeout, params, enqueueCallback) {
	var arg = {};
	arg.event = eventName;
	arg.senderId = this.clientId;
	arg.requestId = this.genGuid();

	arg.tryTimes = tryTimes;
	arg.timeout = timeout;
	arg.args = params;

	this.socket.emit('enqueue', arg, function(result){
		enqueueCallback({ "status" : result.status });
	});
};

///【闻祖东 2014-8-6-171503】当前默认设置为一个事件只允许有一个监听function，需要有多个业务实现的在监听function里面用户自己去分配。
SocketEventClient.prototype.onEventArrived = function(eventName, callback){
	// if(this.listener.indexOf(eventName) >= 0)
	// 	return false;

	//this.eventEmitter.on(eventName, callback);
	this.eventAgent.addListener(eventName, callback);
	this.listener.push(eventName);
	console.log('注册事件' + eventName + '完成');
	return true;
};

SocketEventClient.prototype.genGuid = function() {
    var S4 = function() { 
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }; 

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); 
};

exports.SocketEventClient = SocketEventClient;