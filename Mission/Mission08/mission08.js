// Express 기본 모듈 불러오기
var express = require("express");
var http = require("http");
var path = require("path");

// Express의 미들웨어 불러오기
var bodyParser = require("body-parser");
var statics = require("serve-static");

// 에러 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");

// 파일 업로드용 미들웨어
var multer = require("multer");

// 클라이언트에서 AJAX로 요청 시 CORS(다중 서버 접속) 지원
var cors = require("cors");

// 모듈로 분리한 설정 파일 불러오기
var config = require("./config/config");

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require("./database/database");

// 모듈로 분리한 라우팅 파일 불러오기
var routes = require("./routes/routes");

// 익스프레스 객체 생성
var app = express();

// 포트 설정
app.set("port", process.env.PORT || 3000);

// body-parser 설정
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use("/public", statics(path.join(__dirname, "public")));
app.use("/uploads", statics(path.join(__dirname, "uploads")));

// 클라이언트에서 AJAX로 요청 시 CORS(다중 서버 접속) 지원
app.use(cors());

// multer 미들웨어 사용 : 미들웨어 사용 순서 중요 body-parser -> multer -> router
// 파일 제한 : 10개 1GB
var storage = multer.diskStorage({
	destination: function(req, file, callback)
	{
		callback(null, "uploads");
	},
	filename: function(req, file, callback)
	{
		var extension = path.extname(file.originalname);
		var basename = path.basename(file.originalname, extension);

		callback(null, basename + Date.now() + extension);
	}
});

var upload = multer({
	storage: storage,
	limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});

// 라우팅 정보를 읽어들여 라우팅 설정
routes.init(app, express.Router(), upload);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
	static: {
		"404": "./public/404.html"
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// 웹서버 시작
var server = http.createServer(app).listen(app.get("port"), function()
{
	console.log("웹 서버 시작됨 -> %s, %s", server.address().address, server.address().port);
	database.init(app, config);
});