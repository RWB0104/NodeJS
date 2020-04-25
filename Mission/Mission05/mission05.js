// Express 기본 모듈 불러오기
var express = require("express");
var http = require("http");
var path = require("path");

// Express의 미들웨어 불러오기
var bodyParser = require("body-parser");
var statics = require("serve-static");

// 에러 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");

// ===== MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기 ===== //
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

// 포트 설정
app.set("port", process.env.PORT || 3000);

// body-parser 설정
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use("/public", statics(path.join(__dirname, "public")));

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();

// 메모 저장을 위한 라우팅 함수
router.route("/process/save").post(function(req, res)
{
	console.log("/process/save 호출됨.");

	try
	{
		var paramAuthor = req.body.author;
		var paramContents = req.body.contents;
		var paramCreateDate = req.body.createDate;

		console.log("작성자 : " + paramAuthor);
		console.log("내용 : " + paramContents);
		console.log("일시 : " + paramCreateDate);

		// insertMemo 함수 호출하여 메모 추가
		insertMemo(paramAuthor, paramContents, paramCreateDate, function(err, addedMemo)
		{
			// 에러 발생 시 - 클라이언트로 에러 전송
			if (err)
			{
				console.error("메모 저장 중 에러 발생 : " + err.stack);

				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h2>메모 저장 중 에러 발생</h2>\n");
				res.write("<p>" + err.stack + "</p>");

				res.end();
			}

			// 결과 객체 있으면 성공 응답 전송
			if (addedMemo)
			{
				console.dir(addedMemo);
				console.log("inserted " + addedMemo.affectedRows + " rows");

				var insertId = addedMemo.insertId;
				console.log("추가한 레코드의 아이디 :" + insertId);

				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<div>\n");
				res.write("\t<p>메모가 저장되었습니다.</p>\n");
				res.write("</div>\n");

				res.write("<div>\n");
				res.write("\t<input type=\"button\" value=\"다시 작성\" onclick=\"javascript:history.back()\" />\n");
				res.write("</div>\n");

				res.end();
			}

			else
			{
				res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

				res.write("<h2>메모 저장 실패</h2>");

				res.end();
			}
		});
	}

	catch (err)
	{
		console.dir(err.stack);

		res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

		res.write("<div>\n");
		res.write("\t<p>메모 저장 시 에러 발생</p>\n");
		res.write("</div>");

		res.end();
	}
});

app.use("/", router);

// 메모 추가 함수
var insertMemo = function(author, contents, createDate, callback)
{
	console.log("insertMemo 호출됨 : " + author + ", " + contents + ", " + createDate);

	// 커넥션 풀에서 연결 객체를 가져옴
	pool.getConnection(function(err, conn)
	{
		if (err)
		{
			if (conn)
			{
				// 반드시 해제해야 함
				conn.release();
			}

			callback(err, null);
			return;
		}

		console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

		// 데이터를 객체로 만듦
		var data = {
			AUTHOR: author,
			CONTENTS: contents,
			CREATEDATE: createDate
		};

		// SQL문을 실행함
		var exec = conn.query("INSERT INTO MEMO SET ?", data, function(err, result)
		{
			// 반드시 해제해야 함
			conn.release();
			console.log("실행 대상 SQL : " + exec.sql);

			if (err)
			{
				console.log("SQL 실행 시 에러 발생함.");
				console.dir(err);

				callback(err, null);

				return;
			}

			callback(null, result);
		});

		conn.on("error", function(err)
		{
			console.log("데이터베이스 연결 시 에러 발생함.");
			console.dir(err);

			callback(err, null);
		});
	});
};

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
});