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

var cookieParser = require("cookie-parser");

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use(cookieParser());

app.use("/public", statics(path.join(__dirname, "public")));

router.route("/process/showCookie").get(function(req, res)
{
	console.log("/process/showCookie 호출됨.");

	res.send(req.cookies);
});

router.route("/process/setUserCookie").get(function(req, res)
{
	console.log("/process/setUserCookie 호출됨.");

	// 쿠키 설정
	res.cookie("user", {
		id: "mike",
		name: "소녀시대",
		authorized: true
	});

	// redirect로 응답
	res.redirect("/process/showCookie");
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