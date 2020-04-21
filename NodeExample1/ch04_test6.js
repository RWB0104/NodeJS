var fs = require("fs");

fs.readFile("./package.json", "UTF8", function(err, data)
{
	// 읽어 들인 데이터를 출력합니다.
	console.log(data);
});

console.log("프로젝트 폴더 안의 package.json 파일을 읽도록 요청했습니다.");