var saveMemo = function(req, res)
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

		console.log("# ===== 업로드된 첫번째 파일 정보 ===== #");
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

		// 데이터베이스 객체 참조
		var database = req.app.get("database");

		// 데이터베이스의 pool 객체가 있는 경우
		if (database.pool)
		{
			// memo의 insertMemo 함수 호출하여 메모 추가
			var data = {
				AUTHOR: paramAuthor,
				CONTENTS: paramContents,
				CREATEDATE: paramCreateDate,
				FILENAME: filename
			};

			console.dir(database.MEMO);

			database.MEMO.insertMemo(database.pool, data, function(err, added)
			{
				// 에러 발생 시 - 클라이언트로 에러 전송
				if (err)
				{
					console.error("메모 저장 중 에러 발생 : " + err.satck);

					res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

					res.write("<h2>메모 저장 중 에러 발생</h2>\n");
					res.write("<p>" + err.stack + "</p>");

					res.end();

					return;
				}

				// 결과 객체 있으면 성공 응답 전송
				if (added)
				{
					console.dir(added);
					console.log("inserted " + added.affedctedRows + " rows");

					var insertId = added.insertId;
					console.log("추가한 레코드의 아이디 : " + insertId);

					res.writeHead("200", {"Content-Type": "text/html; charset=UTF8"});

					res.write("<html>\n\n");

					res.write("<head>\n");
					res.write("\t<meta charset=\"UTF-8\" />\n");
					res.write("\t<meta name=\"viewport\" content=\"width=device-width, height=device-height, initial-scale=1\" />\n\n");

					res.write("\t<title>메모 페이지</title>\n\n");

					res.write("\t<!-- 부트스트랩 CSS -->\n");
					res.write("\t<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\" />\n\n");

					res.write("\t<!-- 부트스트랩 테마 CSS -->\n");
					res.write("\t<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\" />\n\n");

					res.write("\t<!-- 제이쿼리 JS -->\n");
					res.write("\t<script src=\"https://code.jquery.com/jquery-3.1.1.min.js\" integrity=\"sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=\" crossorigin=\"anonymous\"></script>\n\n");

					res.write("\t<!-- 제이쿼리 JS -->\n");
					res.write("\t<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n");
					res.write("</head>\n\n");

					res.write("<body>\n");
					res.write("\t <div class=\"container\">\n");
					res.write("\t\t<div class=\"form-group\">\n");
					res.write("\t\t\t<label>메모가 저장되었습니다.</label>\n");
					res.write("\t\t\t<a href=\"#\" class=\"thumbnail\">\n");
					res.write("\t\t\t\t<img src=\"/uploads/" + filename + "\" width=\"200px\" />\n");
					res.write("\t\t\t</a>\n");
					res.write("\t\t\t<br />\n\n");

					res.write("\t\t\t<input type=\"button\" value=\"다시 작성\" onclick=\"javascript:history.back()\" class=\"btn btn-primary\" />\n");
					res.write("\t\t</div>\n");
					res.write("\t</div>\n");
					res.write("</body>\n\n");

					res.write("</html");

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
	}

	catch (err)
	{
		console.dir(err.stack);

		res.writeHead("400", {"Content-Type": "text/html; charset=UTF8"});

		res.write("<div>\n");
		res.write("\t<p>메모 저장 시 에러 발생</p>\n");
		res.write("</div>");
	}
};

// module.exports에 속성으로 추가
module.exports.saveMemo = saveMemo;