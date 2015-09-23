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

	io.on('connection', function(client){

		console.log("Connected client...");
		console.log("EL CLIENTE: ", client);

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
			console.log('Interaction', data);

			// Process data
			var processed_data = process_data(data)

			// Insert into the queue

			publisher(connection_queue,processed_data);      
			
		});

	});
});

app.get('/', function(req, res){
  console.log("GETTING!");
  res.sendFile(__dirname + '/views/index.html');
});

server.listen(8080);
console.log("listening in 8080...");