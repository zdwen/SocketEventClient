var io = require('socket.io-client');
var events = require('events');
var util = require('util');


function SocketEventClient (serverHost, clientId) {
	this.socket = io.connect(serverHost);
	this.clientId = clientId;
	this.subscribeEvents = [];
	this.listener = [];
	this.eventEmitter = new events.EventEmitter();
};

SocketEventClient.prototype.subscribe = function (eventName, eventArrivedCallback, subscribeCallback) {
	var arg = {};
	arg.event = eventName;
	arg.senderId = this.clientId;
	arg.requestId = this.genGuid();
	
	this.socket.emit('subscribe', arg, function(emitResult){
		socket.on(eventName, function(msg){
			eventArrivedCallback(msg);
		});

		subscribeCallback({ "status" : emitResult.status });
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


SocketEventClient.prototype.genGuid = function() {
    var S4 = function() { 
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }; 

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); 
};

exports.SocketEventClient = SocketEventClient;