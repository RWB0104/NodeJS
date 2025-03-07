// Express 기본 모듈 불러오기
var express = require("express");
var http = require("http");
var path = require("path");

// Express 미들웨어 불러오기
var bodyParser = require("body-parser");
var statics = require("serve-static");

// 익스프레스 객체 생성
var app = express();

// 라우터 객체 참조
var router = express.Router();

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use("/public", statics(path.join(__dirname, "public")));

router.route("/process/login/:name").post(function(req, res)
{
	console.log("/process/login/:name 처리함.");

	var paramName = req.params.name;

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

	res.write("<h1>Express 서버에서 응답한 결과입니다.</h1>\n");

	res.write("<div>\n");
	res.write("\t<p>Param name : " + paramName + "</p>\n");
	res.write("</div>\n");

	res.write("<div>\n");
	res.write("\t<p>Param id : " + paramId + "</p>\n");
	res.write("</div>\n");

	res.write("<div>\n");
	res.write("\t<p>Param password : " + paramPassword + "</p>\n");
	res.write("</div>\n");

	res.write("<br />\n");
	res.write("<br />\n");

	res.write("<a href=\"/public/login3.html\">로그인 페이지로 돌아가기</a>\n");

	res.end();
});

// 라우터 객체를 app 객체에 등록
app.use("/", router);

http.createServer(app).listen(3000, function()
{
	console.log("Express 서버가 3000번 포트에서 시작됨.");
});