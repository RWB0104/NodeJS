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

// ===== MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기 ===== //
var mysql = require("mysql");

// ===== MySQL 데이터베이스 연결 설정 ===== //
var pool = mysql.createPool({
	connectionLimit: 10,
	host: "192.168.123.102",
	user: "nodejs",
	password: "314159265359",
	database: "node",
	debug: false
});

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

// 로그인 처리 함수
app.post("/process/login", function(req, res)
{
	console.log("/process/login 호출됨.");

	var paramId = req.param("id");
	var paramPassword = req.param("password");

	console.log("요청 파라미터 : " + paramId + ", " + paramPassword);

	// pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (pool)
	{
		authUser(paramId, paramPassword, function(err, rows)
		{
			// 오류가 발생했을 때 클라이언트로 오류 전송
			if (err)
			{
				console.error("사용자 로그인 중 오류 발생 : " + err.stack);

				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h2>사용자 로그인 중 오류 발생</h2>\n");
				res.write("<p>" + err.stack + "</p>");

				res.end();

				return;
			}

			if (rows)
			{
				console.dir(rows);

				var username = rows[0].NAME;

				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h1>로그인 성공</h1>\n");

				res.write("<div>\n");
				res.write("\t<p>사용자 아이디 : " + paramId + "</p>\n");
				res.write("</div>\n");

				res.write("<div>\n");
				res.write("\t<p>사용자 이름 : " + username + "</p>\n");
				res.write("</div>\n");

				res.write("<br />\n");
				res.write("<br />\n");

				res.write("<a href=\"/public/login2.html\">다시 로그인하기</a>\n");

				res.end();
			}
		});
	}
});

// 사용자 추가 라우팅 함수
router.route("/process/adduser").post(function(req, res)
{
	console.log("/process/adduser 호출됨.");

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;
	var paramName = req.body.name || req.query.name;
	var paramAge = req.body.age || req.query.age;

	console.log("요청 파라미터 : " + paramId + ", " + paramPassword + ", " + paramName + ", " + paramAge);

	// pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (pool)
	{
		addUser(paramId, paramName, paramAge, paramPassword, function(err, addedUser)
		{
			// 동일한 id로 추가할 때 오류 발생 - 클라이언트 오류 전송
			if (err)
			{
				console.error("사요자 추가 중 오류 발생 : " + err.stack);

				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h2>사용자 추가 중 오류 발생</h2>");
				res.write("<p>" + err.stack + "</p>");

				res.end();

				return;
			}

			// 결과 객체 있으면 성공 응답 전송
			if (addedUser)
			{
				console.dir(addedUser);

				console.log("inserted " + addedUser.affectedRows + " rows");

				var insertId = addedUser.insertId;
				console.log("추가한 레코드의 아이디 : " + insertId);

				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h2>사용자 추가 성공</h2>");

				res.end();
			}

			else
			{
				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h2>사용자 추가 실패</h2>");

				res.end();
			}
		});
	}

	// 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
	else
	{
		res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

		res.write("<h2>데이터베이스 연결 실패</h2>");

		res.end();
	}
});

// 라우터 객체 등록
app.use("/", router);

// 사용자를 인증하는 함수 : 아이디로 먼저 찾고 비밀번호를 그다음에 비교
var authUser = function(id, password, callback)
{
	console.log("authUser 호출됨.");

	// 커넥션 풀에서 연결 객체를 가져옵니다.
	pool.getConnection(function(err, conn)
	{
		if (err)
		{
			if (conn)
			{
				// 반드시 해제해야 합니다.
				conn.release();
			}

			callback(err, null);
			return;
		}

		console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

		var columns = ["ID", "NAME", "AGE"];
		var tablename = "USERS";

		// SQL문을 실행합니다.
		var exec = conn.query("SELECT ?? FROM ?? WHERE ID = ? AND PASSWORD = ?", [columns, tablename, id, password], function(err, rows)
		{
			// 반드시 해제해야 합니다.
			conn.release();
			console.log("실행 대상 SQL : " + exec.sql);

			if (rows.length > 0)
			{
				console.log("아이디 [%s], 패스워드 [%s]가 일치하는 사용자 찾음.", id, password);
				callback(null, rows);
			}

			else
			{
				console.log("일치하는 사용자를 찾지 못함.");
				callback(null, null);
			}
		});
	});
};

// 사용자를 등록하는 함수
var addUser = function(id, name, age, password, callback)
{
	console.log("addUser 호출됨.");

	// 커넥션 풀에서 연결 객체를 가져옵니다.
	pool.getConnection(function(err, conn)
	{
		if (err)
		{
			if (conn)
			{
				// 반드시 해제해야 합니다.
				conn.release();
			}

			callback(err, null);
			return;
		}

		console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

		// 데이터를 객체로 만듭니다.
		var data = {
			id: id,
			name: name,
			age: age,
			password: password
		};

		// SQL문을 실행합니다.
		var exec = conn.query("INSERT INTO USERS SET ?", data, function(err, result)
		{
			// 반드시 해제해야 합니다.
			conn.release();

			console.log("실행 대상 SQL : " + exec.sql);

			if (err)
			{
				console.log("SQL 실행 시 오류 발생함.");
				console.dir(err);

				callback(err, null);

				return;
			}

			callback(null, result);
		});
	});
};

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
});