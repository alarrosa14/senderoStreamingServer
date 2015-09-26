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
/* QUEUE https://github.com/squaremo/amqp.node */
/***********************************************/
var clientsQty = -1;
var colorArray = ['243,66,53','205,219,56','156,39,175','3,168,244','0,150,136','255,204,209','255,255,255'];

// Create queue
var interactions_queue = 'interactions_queue';
var connection_queue;

function bail(err) {
  console.error(err);
  process.exit(1);
}

// Publisher
function publisher(conn, data) {
  conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(interactions_queue);
    ch.sendToQueue(interactions_queue, new Buffer(data));
  }
};

// Process the event data 
function process_data(data){
  // Do processing...
  return data;
}

/***********************************************/
/***************** MAIN ************************/
/***********************************************/

queue.connect('amqp://localhost', function(err, conn) {


	connection_queue = conn; 
	conn.createChannel(function(err,ch) {

		io.on('connection', function(client){

			clientsQty = clientsQty + 1;
			client.clientColorIndex = clientsQty;

			console.log("Connected client...");

			/*
			* 
			*/
			client.on('sendFrame', function(data){
				client.broadcast.emit('frame', data);
			});

			/*
			* 
			*/
			client.on('interaction', function (data) {
				// Process data
				var processed_data = process_data(data)

				// Insert into the queue

				// publisher(connection_queue,processed_data);   
				ch.sendToQueue(interactions_queue, new Buffer(data + ',' + colorArray[client.clientColorIndex % colorArray.length]));   
				
			});

		});
	    
 	});
	
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

server.listen(8080);
console.log("listening in 8080...");