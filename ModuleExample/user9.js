// 사용 패턴: exports의 속성 이름을 주면서 추가하되 인스턴스 객체를 만들어 할당함

// 생성자 함수
function User(id, name)
{
	this.id = id;
	this.name = name;
}

User.prototype.getUser = function()
{
	return {id: this.id, name: this.name};
};

User.prototype.group = {id: "group01", name: "프로미스나인"};

User.prototype.printUser = function()
{
	console.log("user 이름 : %s, group 이름 : %s", this.name, this.group.name);
};

exports.user = new User("test01", "장규리");