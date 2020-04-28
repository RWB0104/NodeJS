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

// mongoose 모듈 불러들이기
var mongoose = require("mongoose");

var user = require("./routes/user");

// 데이터베이스 객체를 위한 변수 선언
var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
var UserModel;

// 데이터베이스에 연결
function connectDB()
{
	// 데이터베이스 연결 정보
	var databaseUrl = "mongodb://192.168.123.102:27017/local";

	// 데이터베이스 연결
	console.log("데이터베이스 연결을 시도합니다.");

	mongoose.Promise = global.Promise;
	mongoose.connect(databaseUrl);

	database = mongoose.connection;

	database.on("error", console.error.bind(console, "mongoose connection error."));
	database.on("open", function()
	{
		console.log("데이터베이스에 연결되었습니다. : " + databaseUrl);

		// user 스키마 및 모델 객체 생성
		createUserSchema();
	});

	// 연결 끊어졌을 때 5초 후 재연결
	database.on("disconnected", function()
	{
		console.log("연결이 끊어졌습니다. 5초 후 다시 연결합니다.");

		setInterval(connectDB, 5000);
	});
}

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);

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

// 라우터 객체 참조
var router = express.Router();

app.post("/process/login", user.login);

router.route("/process/adduser").post(user.adduser);

router.route("/process/listuser").post(user.listuser);

// 라우터 객체 등록
app.use("/", router);

function createUserSchema()
{
	// user_schema.js 모듈 불러오기
	UserSchema = require("./database/user_schema").createSchema(mongoose);

	// UserModel 모델 정의
	UserModel = mongoose.model("users3", UserSchema);

	user.init(database, UserSchema, UserModel);

	console.log("UserModel 정의함.");
}

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

	// 데이터베이스 연결
	connectDB();
});