// 사용 패턴: exports의 속성 이름을 주면서 추가하되 프로토타입 객체를 정의한 후 할당함
var User = require("./user10");
var user = new User("test01", "장규리");

user.printUser();