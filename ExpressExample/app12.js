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

var expressSession = require("express-session");

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use(cookieParser());

app.use(expressSession({
	secret: "my key",
	resave: true,
	saveUninitialized: true
}));

app.use("/public", statics(path.join(__dirname, "public")));

// 로그인 라우팅 함수 - 로그인 후 세션 저장함
router.route("/process/login").post(function(req, res)
{
	console.log("/process/login 호출됨.");

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	if (req.session.user)
	{
		// 이미 로그인된 상태
		console.log("이미 로그인되어 상품 페이지로 이동합니다.");

		res.redirect("/public/product.html");
	}

	else
	{
		// 세션 저장
		req.session.user = {
			id: paramId,
			name: "소녀시대",
			authorized: true
		};

		res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

		res.write("<h1>로그인 성공</h1>\n");

		res.write("<div>\n");
		res.write("\t<p>Param id : " + paramId + "</p>\n");
		res.write("</div>\n");

		res.write("<div>\n");
		res.write("\t<p>Param password : " + paramPassword + "</p>\n");
		res.write("</div>\n");

		res.write("<br />");
		res.write("<br />");

		res.write("<a href=\"/process/product\">상품 페이지로 이동하기</a>");

		res.end();
	}
});

router.route("/process/logout").get(function(req, res)
{
	console.log("/process/logout 호출됨.");

	if (req.session.user)
	{
		// 로그인된 상태
		console.log("로그아웃합니다.");

		req.session.destroy(function(err)
		{
			if (err)
			{
				throw err;
			}

			console.log("세션을 삭제하고 로그아웃되었습니다.");

			res.redirect("/public/login2.html");
		});
	}

	else
	{
		// 로그인 안된 상태
		console.log("아직 로그인되어 있지 않습니다.");

		res.redirect("/public/login2.html");
	}
});

// 상품정보 라우팅 함수
router.route("/process/product").get(function(req, res)
{
	console.log("/process/product 호출됨.");

	if (req.session.user)
	{
		res.redirect("/public/product.html");
	}

	else
	{
		res.redirect("/public/login2.html");
	}
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