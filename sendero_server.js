var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var queue = require('amqplib/callback_api');

app.use(express.static(path.join(__dirname, 'public')));

require('socket.io-stream')(io);

/***********************************************/
/***************** MAIN ************************/
/***********************************************/


io.on('connection', function(client){

	console.log("Connected client...");

	/*
	* 
	*/
	client.on('sendFrame', function(){
		console.log('sendFrame');
		client.broadcast.emit('frame', [255,0,0,0,255,0,0,0,255]);
	});

});

server.listen(8080);
console.log("listening in 8080...");