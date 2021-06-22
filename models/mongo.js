var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// mongoose.connect('mongodb://localhost:27017/CoursesDB');
mongoose.connect('mongodb://localhost:27017/Login', {useNewUrlParser: true}, (err) => {
	if (!err){
		console.log('Successfully establish connection with MongoDB');
	}
	else {
		console.log('Failed to establish connection with MongoDB with error: ' + err);
	}
});

var userSchema = new mongoose.Schema({
	'username': String,
	'userEmail' : String,
	'userPassword' : String
});

//authenticate input against database
userSchema.statics.authenticate = function (email, password, callback) {
	User.findOne({ userEmail: email })
		.exec(function (err, user) {
			if (err) {
				return callback(err)
			} else if (!user) {
				var err = new Error('User not found.');
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.userPassword, function (err, result) {
				if (result === true) {
					return callback(null, user);
				} else {
					return callback();
				}
			})
		});
};

var User = mongoose.model('user', userSchema);    // this will be displayed as database Collection in mongoDB
module.exports = User;
// module.exports = mongoose.model('user', userSchema); // this will be displayed as database Collection in mongoDB
