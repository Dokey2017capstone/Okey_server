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
    pythonPath: '',
    scriptPath: './okey_test'
}

var pyShell = new PythonShell("test.py", options);
//net.createServer([options],[connectionListener]) option-소켓 server 객체 생성시 사용되는 특정 옵션을 지정,
//connetionListner- 콜백 함수로 연결된 클라이언트를 위한 Socket 객체를 전달
var server = net.createServer(function(client) { //TCP 소켓 서버 생성(net.Server객체 사용) 
	console.log('Client connection: ');
	console.log('   local = %s:%s', client.localAddress, client.localPort);
	console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
	
	client.setEncoding('utf8');

	jsonData = "";
	resultJson = "";
	modiData = "";

	client.on('data', function(data) { //이벤트 헨들러(클라이언트로부터 받은 데이터를 처리)
		responseData = "";
		modiResult = "";
		spaceResult = "";
  		console.log('Received data from client on port %d: %s', client.remotePort, data.toString());//클라이언트 포트와 데이터 로그

		jsonData = JSON.parse(data); //JSON 객체화
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

	client.on('end', function() { //소켓 종료 처리
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

server.listen(8100, function() { //8100 포트로 연결 수신
	console.log('Server listening: ' + JSON.stringify(server.address()));

	server.on('close', function(){//Server와 연결된 소켓을 닫음
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

				resultJson += ('"' + modiAry[i] + '" : [ "' + i + '", "' + resultAry[i] +'"]');// 나는 밥을 머습니다->"나는":["0","나는"],"밥을":["1","밥을"],"머습니다":["2","먹습니다"]
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
