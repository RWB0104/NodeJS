var http = require("http");

// 웹 서버 객체를 만듭니다.
var server = http.createServer();

// 웹 서버를 시작하여 3000번 포트에서 대기하도록 설정합니다.
var port = 3000;

server.listen(port, function()
{
	console.log("웹 서버가 시작되었습니다. : %d", port);
});

// 클라이언트 연결 이벤트 처리
server.on("connection", function(socket)
{
	var addr = socket.address();

	console.log("클라이언트가 접속했습니다. : %s:%d", addr.address, addr.port);
});

// 클라이언트 요청 이벤트 처리
server.on("request", function(req, res)
{
	console.log("클라이언트 요청이 들어왔습니다.");

	res.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"});

	res.write("<!DOCTYPE html>\n");
	res.write("<html>\n\n");

	res.write("<head>\n");
	res.write("\t<title>응답 페이지</title>\n");
	res.write("</head>\n\n");

	res.write("<body>\n");
	res.write("\t<h1>노드제이에스로부터의 응답 페이지</h1>\n");
	res.write("</body>\n\n");

	res.write("</html>");

	res.end();
});

// 서버 종료 이벤트 처리
server.on("close", function()
{
	console.log("서버가 종료됩니다.");
});