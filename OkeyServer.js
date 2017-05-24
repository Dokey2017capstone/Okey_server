var PythonShellSpacing = require('python-shell');
var PythonShellSpellCheck = require('python-shell');
var responseStr = '{"response" : [';
var responseData = "";
var modiResult = "";
var spaceResult = "";

var optionSpacing = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	scriptPath: './okey_spacing'
}

var optionSpellCheck = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	scriptPath: './spell_check_main'
}

var spacingShell = new PythonShellSpacing("server_spacing.py", optionSpacing);
//var spellCheckShell = new PythonShellSpellCheck("spell_check_tensorflow.py", optionSpellCheck);

spacingShell.on('message', function(message){
	console.log('Spacing data get : ' + message);
	spaceResult = message;
});
//spellCheckShell.on('message', function(message){
//	console.log(message);
//});

var server = require('net').createServer(function(socket){
	console.log('new connection');
	console.log('Client connection: ');
	console.log('   local = %s:%s', socket.localAddress, socket.localPort);
	console.log('   remote = %s:%s', socket.remoteAddress, socket.remotePort);

	socket.setEncoding('utf8');

	socket.write("Type 'quit' to exit.\n");

	socket.on('data',function(data){
		responseData = "";
		modiResult = "";
		spaceResult = "";
		
		console.log('Received data from client on port %d: %s', socket.remotePort, data.toString());

		var jsonData = JSON.parse(data);
		console.log('jsonData : ' + jsonData.spacingData);
		var isOnlyModify = true;
		var resultJson = "";

		var requestNum = jsonData.request.length;

		jsonData.request.forEach(function(e) {
			if(e == "spacing") {
				isOnlyModify = false;
				responseData += '"spacing"';

				spacingShell.send(jsonData.spacingData);
				resultJson += ('"spaing" : ' + spaceResult)
				console.log('spacing end! : ', resultJson);
			}
			else if(e == "modified") {
				if(isOnlyModify)
					responseData += '"modified"';
				else(!isOnlyModify)
					responseData += ', "modified"';

			}
		});

		responseStr = responseStr + responseData + '], ' + resultJson + '}';
		console.log(responseStr);
	});
        
	socket.on('end',function() {
		console.log('Client connection ended');
	});

	socket.on('error', function() {
		console.log('Socket Error: ', JSON.stringify(err));
	});

	socket.on('timeout', function() {
		console.log('Socket Timed Out');
	});
}).listen(8100);

function writeData(socket, data) {
	var success = !socket.write(data);
	if (!success) {
		(function(socket, data) {
			socket.once('drain', function() {
				writeData(socket, data);
			});
		})(socket, data);
	}
}
