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

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require("cors");

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
// 파일 제한 : 10개, 1GB
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

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();

// 메모 저장을 위한 라우팅 함수
router.route("/process/save").post(upload.array("photo", 1), function(req, res)
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

		var files = req.files;

		console.log("# ===== 업로드된 파일 ===== #");
		console.dir(req.files[0]);
		console.log("# ===== #");

		// 현재의 파일 정보를 저장할 변수 선언
		var originalname = "";
		var filename = "";
		var mimetype = "";
		var size = 0;

		// 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
		if (Array.isArray(files))
		{
			console.log("배열에 들어있는 파일 갯수 : %d", files.length);

			for (var index = 0; index < files.length; index++)
			{
				originalname = files[index].originalname;
				filename = files[index].filename;
				mimetype = files[index].mimetype;
				size = files[index].size;
			}

			console.log("현재 파일 정보 : " + originalname + ", " + filename + ", " + mimetype + ", " + size);
		}

		else
		{
			console.log("업로드된 파일이 배열에 들어가 있지 않습니다.");
		}

		res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

		res.write("<div>\n");
		res.write("\t<p>메모가 저장되었습니다.</p>\n");
		res.write("</div>\n");

		res.write("<img src=\"/uploads/" + filename + "\" width=\"200px\" />\n");

		res.write("<div>\n");
		res.write("\t<input type=\"button\" value=\"다시 작성\" onclick=\"javascript:history.back()\" />\n");
		res.write("</div>\n");
	}

	catch (err)
	{
		res.writeHead("400", {"Content-Type": "text/html; charset=UTF8"});

		res.write("<div>\n");
		res.write("\t<p>메모 저장 시 에러 발생</p>\n");
		res.write("</div>\n");
	}
});

app.use("/", router);

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
	console.log("웹 서버 시작됨 -> %s:%s", server.address().address, server.address().port);
});