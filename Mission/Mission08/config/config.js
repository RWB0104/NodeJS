module.exports = {
	server_port: 3000,
	db: {
		connectionLimit: 10,
		host: "192.168.123.102",
		user: "nodejs",
		password: "314159265359",
		database: "node",
		debug: false
	},
	db_schemas: [
		{
			name: "MEMO",
			file: "../database/memo_database"
		}
	],
	routes: [
		{
			file: "./memo",
			path: "/process/save",
			method: "saveMemo",
			type: "POST",
			upload: "photo"
		}
	]
};