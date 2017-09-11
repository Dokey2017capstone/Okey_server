// Web server library
var responseStr = '{"response" : [';
var async = require('async');
var net = require('net');
var PythonShell = require('python-shell'); 
var readline = require('readline');
var isModify = false;
var isSpace = false;
var isGetMessageDone = false;
var count = 0;

var jsonData = "";
var resultJson = "";
var modiData = "";

var options = { 
    mode: 'text',
    //pythonPath: '/usr/bin/python3',
	pythonPath: ''
    scriptPath: './okey_test'
}

var pyShell = new PythonShell("test.py", options);
//net.createServer([options],[connectionListener]) option-���� server ��ü ������ ���Ǵ� Ư�� �ɼ��� ����,
//connetionListner- �ݹ� �Լ��� ����� Ŭ���̾�Ʈ�� ���� Socket ��ü�� ����
var server = net.createServer(function(client) { //TCP ���� ���� ����(net.Server��ü ���) 
	console.log('Client connection: ');
	console.log('   local = %s:%s', client.localAddress, client.localPort);
	console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
	
	client.setEncoding('utf8');

	jsonData = "";
	resultJson = "";
	modiData = "";

	client.on('data', function(data) { //�̺�Ʈ ��鷯(Ŭ���̾�Ʈ�κ��� ���� �����͸� ó��)
		responseData = "";
		modiResult = "";
		spaceResult = "";
  		console.log('Received data from client on port %d: %s', client.remotePort, data.toString());//Ŭ���̾�Ʈ ��Ʈ�� ������ �α�

		jsonData = JSON.parse(data); //JSON ��üȭ
		resultJson = "";
		modiData = "";		
	
		if(jsonData.request[0] == "spacing") {
			pyShell.send('2' + jsonData.spacingData);
			isModify = false;
			isSpace = true;
			writeData(client);
		}
		else if(jsonData.request[0] == "modified") {
			pyShell.send('1'+jsonData.modifiedData.trim());
			modiData = jsonData.modifiedData.trim();
			isModify = true;
			isSpace = false;
			writeData(client);
		}     
	});

	client.on('end', function() { //���� ���� ó��
		console.log('Client disconnected');
		server.getConnections(function(err, count) {
			console.log('Remaining Connections: ' + count);
		});
	});
	client.on('error', function(err) {
	});
	client.on('timeout', function() {
		console.log('Socket Timed out');
	});
});

server.listen(8100, function() { //8100 ��Ʈ�� ���� ����
	console.log('Server listening: ' + JSON.stringify(server.address()));

	server.on('close', function(){//Server�� ����� ������ ����
		console.log('Server Terminated');
	});
	server.on('error', function(err){
		console.log('Server Error: ', JSON.stringify(err));
	});
});
 
function writeData(client){
	pyShell.on('message', function(message) {
		if(isSpace) {
			var resultResponse = responseStr + '"spacing"' + '], "spacing" : "' + message  + '"}\n\f\n';
			if(!count) {
				count++;
				console.log('spacing end : ' + message);
				console.log(resultResponse);
			}
			client.write(resultResponse);
		}
		if(isModify) {
			var modiAry = modiData.split(' ');

			var resultAry = message.split(',');
			resultJson = '"modified" : {'
			for(var i = 0; i < modiAry.length; i++) {
				if(i != 0) resultJson += ', '

				resultJson += ('"' + modiAry[i] + '" : [ "' + i + '", "' + resultAry[i] +'"]');// ���� ���� �ӽ��ϴ�->"����":["0","����"],"����":["1","����"],"�ӽ��ϴ�":["2","�Խ��ϴ�"]
			}
			resultJson += '}';
			var resultResponse = responseStr + '"modified"' + '], ' + resultJson  + '}\n\f\n';
			if(!count) {
				console.log('modifying end : ' + message);
				count++;
				console.log(resultResponse);
			}
			client.write(resultResponse);
		}
	});
	count = 0;
}
