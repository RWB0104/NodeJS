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

// 오류 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use("/public", statics(path.join(__dirname, "public")));

router.route("/process/users/:id").get(function(req, res)
{
	console.log("/process/users/:id 처리함.");

	// URL 파라미터 확인
	var paramId = req.params.id;

	console.log("/process/users와 토큰 %s를 이용해 처리함.", paramId);

	res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

	res.write("<h1>Express 서버에서 응답한 결과입니다.</h1>\n");

	res.write("<div>\n");
	res.write("\t<p>Param id : " + paramId + "</p>\n");
	res.write("</div>\n");

	res.end();
});

// 라우터 객체를 app 객체에 등록
app.use("/", router);

// 404 에러 페이지 처라
var errorHandler = expressErrorHandler({
	static: {
		"404": "./public/404.html"
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(3000, function()
{
	console.log("Express 서버가 3000번 포트에서 시작됨.");
});