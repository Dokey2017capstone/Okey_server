var shell = require('python-shell');
var readline = require('readline');	//표준 입출력

var options = {
	 mode: 'text',
	pythonPath: '/usr/bin/python3',
	scriptPath: './okey_spellCheck'
 
}	//연결할 파이썬코드의 옵션

//파이썬 소스 실행? 연결?
var pyshell = new shell('spell_check_tensorflow.py',options);

//파이썬 소스에 해당 문자열 송신
//pyshell.send("hello")
//pyshell.send("hello")

//표준입력으로 입력받기
var r = readline.createInterface({
	input:process.stdin});
//r.setPrompt('> ');
r.prompt();

//표준입력에 대한 이벤트 함수
r.on('line', function(line){
	pyshell.send(line)
	r.prompt()});

//파이썬 소스에서 문자열 송신시 이벤트 함수
pyshell.on('message', function(message){
	console.log(message)})
