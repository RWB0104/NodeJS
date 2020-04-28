// module.exports에는 객체를 그대로 할당할 수 있음
var user = {
	getUser: function()
	{
		return {id: "test01", name: "장규리"};
	},
	group: {id: "group01", name: "프로미스나인"}
};

module.exports = user;