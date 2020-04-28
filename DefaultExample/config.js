module.exports = {
	server_port: 3000,
	db_url: "mongodb://192.168.123.102:27017/local",
	db_schemas: [
		{
			file: "./user_schema",
			collection: "users3",
			schemaName: "UserSchema",
			modelName: "UserModel"
		}
	],
	route_info: [
		{
			file: "./user",
			path: "/process/login",
			method: "login",
			type: "POST"
		},
		{
			file: "./user",
			path: "/process/adduser",
			method: "adduser",
			type: "POST"
		},
		{
			file: "./user",
			path: "/process/listuser",
			method: "listuser",
			type: "POST"
		}
	]
};