// Web server library
var express = require('express');
var app = express();
var responseStr = '{"response" : [';
var responseData = "";
var modiResult = "";
var spaceResult = "";
var jsonD = '{"request" : ["spacing", "modified"], "spacingData" : "수정할 스트링1", "modifiedData" : "수정할 스트링2"}'

app.get('/', function(req, res){
        res.send('Okey Server');
});

var net = require('net');

var server = net.createServer(function(client) {
	console.log('Client connection: ');
	console.log('   local = %s:%s', client.localAddress, client.localPort);
	console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
	
	//client.setTimeout(3000);
	client.setEncoding('utf8');
	client.on('data', function(data) {
		responseData = "";
		modiResult = "";
		spaceResult = "";
  		console.log('Received data from client on port %d: %s', client.remotePort, data.toString());

		var jsonData = JSON.parse(data);
		console.log('jsonData : ' + jsonData.spacingData);
		var count = 0;
		var resultJson = "";
		jsonData.request.forEach(function(e){
			if(e == "spacing") {
				count++;
				responseData += '"spacing"';
				
				console.log('spacing start! : ' + jsonData.spacingData);
				var spawn = require('child_process').spawn;
				var py = spawn('python', ["./Okey_spacing/server_spacing.py", jsonData.spacingData]);
				py.stdout.on('data', function (data) {
					resultJson += ('"spacing" : ' + data.trim());
					console.log('After spacing : ' + spaceData)
					//var responseStr = '{ "response" : ["spacing"], "spacing" : "' + spacedData + '"}\n';
					//writeData(client, responseStr);
					//console.log('Sending: ' + responseStr);
				});		
				py.stdout.on('exit', function (code) {
					if (code != 0) {
						console.log('Failed: ' + code);
					}
				});
			}
			else if(e == "modified")
			{
				if(count == 1) {
					responseData += ', "modified"';
				}			
				else {
					responseData += '"modified"';
				}			

				var modifiedData = jsonData.modifiedData;
				console.log('modifing start : ' + jsonData.modifiedData);
				var spawn = require('child_process').spawn;
				var py = spawn('python3', ["./spell_check_tensorflow.py", modifiedData]);	

				py.stdout.on('data', function (data) {
					console.log(data.toString('utf-8'));
					modiResult += data.toString('utf-8')
				});	
	
				py.stdout.on('exit', function (code) {
					if (code != 0) {
						console.log('Failed: ' + code);
					}
				});
			};
		});
		writeData(responseStr + responseData + '], ' + resultJson + '}')
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

app.listen(80, function(){
	console.log('Connect 80 port');
});

