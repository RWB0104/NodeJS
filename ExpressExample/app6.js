var express = require("express");
var http = require("http");

// 익스프레스 객체 생성
var app = express();

app.use(function(req, res, next)
{
	console.log("첫 번째 미들웨어에서 요청을 처리함.");

	var userAgent = req.header("User-Agent");
	var paramName = req.query.name;

	res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

	res.write("<h1>Express 서버에서 응답한 결과입니다.</h1>\n");

	res.write("<div>\n");
	res.write("\t<p>User-Agent : " + userAgent + "</p>\n");
	res.write("</div>\n");

	res.write("<div>\n");
	res.write("\t<p>Param name : " + paramName + "</p>\n");
	res.write("</div>\n");

	res.end();
});

http.createServer(app).listen(3000, function()
{
	console.log("Express 서버가 3000번 포트에서 시작됨.");
});