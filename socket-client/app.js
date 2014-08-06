var io = require('socket.io-client');
//var socket = io.connect('http://localhost:3100/');
var socket = io.connect('http://127.0.0.1:2900/');

//socket.emit('subscribe', 'hehe');
socket.on("PriceChanged", function(result){
	console.log('PriceChanged event Arrived, and the message is: ' + result);
});	

var obj = {
	"event":"PriceChanged",
	"requestId":"af033902-dd04-4f0b-a025-8700fff8253d",
	"senderId":"WzdClient_Node"
};

socket.emit('subscribe', obj, function(result1){
	console.log('subscribe completed, and the msg is: ' + result1);
});





var http = require('http');
http.createServer(function (req, res) {


	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');


}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

