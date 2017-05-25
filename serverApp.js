// Web server library
var responseStr = '{"response" : [';
var async = require('async');
var net = require('net');
var PythonShell = require('python-shell');
var readline = require('readline');
var isModify = false;
var isSpace = false;
var isGetMessageDone = false;


var jsonData = "";
var resultJson = "";
var modiData = "";

var options = { 
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    scriptPath: './okey_test'
}

var pyShell = new PythonShell("test.py", options);


var server = net.createServer(function(client) {
	console.log('Client connection: ');
	console.log('   local = %s:%s', client.localAddress, client.localPort);
	console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
	
	client.setEncoding('utf8');

	jsonData = "";
	resultJson = "";
	modiData = "";

	client.on('data', function(data) {
		responseData = "";
		modiResult = "";
		spaceResult = "";
  		console.log('Received data from client on port %d: %s', client.remotePort, data.toString());

		jsonData = JSON.parse(data);
		resultJson = "";
		modiData = "";		
		//jsonData.request.forEach(function(e)
		if(jsonData.request[0] == "spacing") {
			pyShell.send('2' + jsonData.spacingData);
			isModify = false;
			isSpace = true;
		}
		else if(jsonData.request[0] == "modified") {
			pyShell.send('1'+jsonData.modifiedData.trim());
			modiData = jsonData.modifiedData.trim();
			isModify = true;
			isSpace = false;
		}     
	});

	pyShell.on('message', function(message) {
		if(isSpace) {
			console.log('spacing end : ' + message);
    
			resultJson = ('"spacing" : "' + message + '"');
			console.log('spacing end! : ', resultJson);
			var resultResponse = responseStr + '"spacing"' + '], "spacing" : "' + message  + '"}\n\f\n';

			console.log(resultResponse);
			writeData(client, resultResponse);
		}
		if(isModify) {
			console.log('modifying end : ' + message);
			var modiAry = modiData.split(' ');

			var resultAry = message.split(',');
			resultJson = '"modified" : {'
			for(var i = 0; i < modiAry.length; i++) {
				if(i != 0) resultJson += ', '

				resultJson += ('"' + modiAry[i] + '" : [ "' + i + '", "' + resultAry[i] +'"]');
			}
			resultJson += '}';
			var resultResponse = responseStr + '"modified"' + '], ' + resultJson  + '}\n\f\n';
			console.log(resultResponse);
			writeData(client, resultResponse);
		}
	}); 
  	
	client.on('end', function() {
		console.log('Client disconnected');
		server.getConnections(function(err, count) {
			console.log('Remaining Connections: ' + count);
		});
	});
	client.on('error', function(err) {
		console.log('Socket Error: ', JSON.stringify(err));
	});
	client.on('timeout', function() {
		console.log('Socket Timed out');
	});
});

server.listen(8100, function() {
	console.log('Server listening: ' + JSON.stringify(server.address()));
	server.on('close', function(){
		console.log('Server Terminated');
	});
	server.on('error', function(err){
		console.log('Server Error: ', JSON.stringify(err));
	});
});
 
function writeData(socket, data){
	var success = !socket.write(data);
	if (!success){
		(function(socket, data){
			socket.once('drain', function(){
				writeData(socket, data);
			});
		})(socket, data);
	}
}

