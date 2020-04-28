// module.exports가 사용되면 exports는 무시됨
module.exports = {
	getUser: function()
	{
		return {id: "test01", name: "장규리"};
	},
	group: {id: "group01", name: "프로미스나인"}
};

exports.group = {id: "group02", name: "아이즈원"};