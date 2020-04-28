var memo = {};

var sql = {
	insertMemo: "INSERT INTO MEMO SET ?"
};

// 메모 추가 함수
var insertMemo = function(pool, data, callback)
{
	console.log("insertMemo 호출됨.");
	console.dir(data);

	pool.execute(pool, sql.insertMemo, data, callback);
};

memo.insertMemo = insertMemo;

module.exports = memo;