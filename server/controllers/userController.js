const mysql = require('mysql')

// Connection Pool
const pool = mysql.createPool({
	connectionLimit: 100,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});

// View
exports.view = (req, res) => {
	// Connect DB
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connected ' + connection.threadId)
		// User Connection
		connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
			//release when done with conn
			connection.release();
			if (!err) {
				let removedUser = req.query.removed;
				res.render('home', { rows, removedUser });
			} else {
				console.log(err);
			}
			console.log('data from user table: \n', rows)
		});
	});
}

// Search
exports.find = (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connected ' + connection.threadId)
		let searchTerm = req.body.search;
		connection.query('SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?',
			['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
				connection.release();
				if (!err) {
					res.render('home', { rows });
				} else {
					console.log(err);
				}
				console.log('data from user table: \n', rows)
			});
	});
}

exports.form = (req, res) => {
	res.render('add-user');
}

// Create
exports.create = (req, res) => {
	const { first_name, last_name, email, phone, comments } = req.body;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connected ' + connection.threadId)
		let searchTerm = req.body.search;
		connection.query('INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?',
			[first_name, last_name, email, phone, comments], (err, rows) => {
				connection.release();
				if (!err) {
					res.render('add-user', { alert: 'User added successfuly' });
				} else {
					console.log(err);
				}
				console.log('data from user table: \n', rows)
			});
	});
}

//Edit 
exports.edit = (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connected ' + connection.threadId)
		connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
			connection.release();
			if (!err) {
				res.render('edit-user', { rows });
			} else {
				console.log(err);
			}
			console.log('data from user table: \n', rows)
		});
	});
}


// Update
exports.update = (req, res) => {
	const { first_name, last_name, email, phone, comments } = req.body;

	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connected ' + connection.threadId)
		connection.query('UPDATE user SET first_name = ?, last_name= ?, email = ?, phone = ?, comments = ? WHERE id = ?',
			[first_name, last_name, email, phone, comments, req.params.id], (err, rows) => {
				connection.release();
				if (!err) {
					pool.getConnection((err, connection) => {
						if (err) throw err;
						console.log('Connected ' + connection.threadId)
						connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
							connection.release();
							if (!err) {
								res.render('edit-user', { rows, alert: `${first_name} has been updated` });
							} else {
								console.log(err);
							}
							console.log('data from user table: \n', rows)
						});
					});
				} else {
					console.log(err);
				}
				console.log('data from user table: \n', rows)
			});
	});

}

//Delete records
// exports.delete = (req, res) => {
// 	pool.getConnection((err, connection) => {
// 		if (err) throw err;
// 		console.log('Connected ' + connection.threadId)
// 		connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {
// 			connection.release();
// 			if (!err) {
// 				res.redirect('/');
// 			} else {
// 				console.log(err);
// 			}
// 			console.log('data from user table: \n', rows)
// 		});
// 	});
// }

//Delete 
exports.delete = (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query('UPDATE user SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
			connection.release();
			if (!err) {
				let removedUser = encodeURIComponent('User successfully removed');
				res.redirect('/?removed=' + removedUser);
			} else {
				console.log(err);
			}
			console.log('data from user table: \n', rows)
		});
	});
}

exports.viewall = (req, res) => {
	// Connect DB
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connected ' + connection.threadId)
		// User Connection
		connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
			//release when done with conn
			connection.release();
			if (!err) {
				res.render('view-user', { rows });
			} else {
				console.log(err);
			}
			console.log('data from user table: \n', rows)
		});
	});
}