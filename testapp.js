// Web server library
var responseStr = '{"response" : [';
var async = require('async');
var net = require('net');
var PythonShell = require('python-shell');
var PythonShell = require('python-shell');
var readline = require('readline');
var count = 0;
var isGetMessageDone = false;
var modifiedAry = new Array();

var spacingData = '{';

var optionSpacing = { 
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    scriptPath: './okey_spacing'
}

var optionSpellCheck = { 
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    scriptPath: './okey_spellCheck'
}

var spellCheckShell = new PythonShell("spell_check_tensorflow.py", optionSpellCheck);
//var spacingShell = new PythonShell("server_spacing.py", optionSpacing);
//var testShell = new PythonShell('spell_check_tensorflow.py', optionSpellCheck);

//var r = readline.createInterface({
//	input:process.stdin});
//r.setPrompt('> ');
//r.prompt();

//r.on('line', function(line) {
//	testShell.send(line);
//	r.setPrompt('> ');
//	r.prompt();
//});

//testShell.on('message', function(message) {
//	console.log(message);
//});

//spellCheckShell.on('message', function(message) {
//	console.log('spellCheck :' +  message);
//});

spellCheckShell.on('message', function(message) {
	console.log('spellCheck ' + count + ': ' + message);

	if(count != 0) spacingData += ', ';
	spacingData += ('"' + modifiedAry[count] + '" : ["' + count + '", "' + message + '"]');
	if(count == modifiedAry.length - 1) {
		spacingData += '}';
		var resultResponse = responseStr + '"modified"' + '], "modified" : ' + spacingData + '}\n\f\n';
		isGetMessageDone = true;
		console.log(resultResponse);
		count = 0;
	}
	else count++;
});

var server = net.createServer(function(client) {
	console.log('Client connection: ');
	console.log('   local = %s:%s', client.localAddress, client.localPort);
	console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
	
	client.setEncoding('utf8');
	client.on('data', function(data) {
		responseData = "";
		modiResult = "";
		spaceResult = "";
  		console.log('Received data from client on port %d: %s', client.remotePort, data.toString());

		var jsonData = JSON.parse(data);
		var resultJson = "";
		
		//jsonData.request.forEach(function(e){
			if(jsonData.request[0] == "spacing") {
                spacingShell.send(jsonData.spacingData);
    
                spacingShell.on('message', function(message) {
                    console.log('spacing end : ' + message);
    
                    resultJson += ('"spacing" : "' + message + '"');
                    console.log('spacing end! : ', resultJson);
                    var resultResponse = responseStr + '"spacing"' + '], "spacing" : "' + message  + '"}\n\f\n';

                    console.log(resultResponse);
                    writeData(client, resultResponse);
                }); 
            }   
			else if(jsonData.request[0] == "modified")
			{
				var modifiedData = jsonData.modifiedData.trim();
				modifiedAry = modifiedData.split(' ');	
				console.log(modifiedAry);
				console.log(modifiedAry.length);

				spacingData = '{';
				spellCheckShell.send(modifiedData);
				while(!isGetMessageDone){}
				
				writeData(client, resultResponse);
			};
		//});
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
<<<<<<< HEAD


=======
>>>>>>> 5b87cf1ded942f2e82e27a9e340b8c15fa8fefbc
