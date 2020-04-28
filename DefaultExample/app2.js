// Express 기본 모듈 불러오기
var express = require("express");
var http = require("http");
var path = require("path");

// Express 미들웨어 불러오기
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var statics = require("serve-static");
var errorHandler = require("errorhandler");

// 오류 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");

// Session 미들웨어 불러오기
var expressSession = require("express-session");

var config = require("./config");
var database = require("./database/database");
var route_loader = require("./routes/route_loader");

// 데이터베이스 객체를 위한 변수 선언
var database;

// 익스프레스 객체 생성
var app = express();

// ===== 서버 변수 설정 및 static으로 [public] 폴더 설정 ===== //
console.log("config.server_port : %d", config.server_port);
app.set("port", process.env.PORT || config.server_port);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use("/public", statics(path.join(__dirname, "public")));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret: "my key",
	resave: true,
	saveUninitialized: true
}));

// 라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, express.Router());

// ===== 404 오류 페이지 처리 ===== //
var errorHandler = expressErrorHandler({
	static: {
		"404": "./public/404.html"
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// ===== 서버 시작 ===== //
http.createServer(app).listen(3000, function()
{
	console.log("서버가 시작되었습니다. 포트 : " + app.get("port"));

	// 데이터베이스 초기화
	database.init(app, config);
});