var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoOp = require('./models/mongo');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : true}));

app.use(express.static("public"));

// List all users
router.route('/users')
	.get(function(req,res){
		var response = {};
		mongoOp.find({},function(err,data){
			// Mongo command to fetch all data from collection.
			if(err) {
				response = {"error" : true,"message" : "Error fetching data"};
			} else {
				response = {"error" : false,"message" : data};
			}
			res.json(response);
		});
	});

// Register new account
router.route('/register')
	.post([check('emailSignup').isEmail(), check('passwordSignup').isLength({min: 5})], function(req,res){
		
		const errors = validationResult(req);
		console.log(req.body);
		if(!errors.isEmpty()){
			return res.status(422).jsonp(errors.array());
		}
		else {
			console.log('Let Sign up!');
		}
		
		var db = new mongoOp();
		var response = {};
		
		db.username = req.body.usernameSignup;
		db.userEmail = req.body.emailSignup;

		db.userPassword = bcrypt.hash(req.body.passwordSignup, 10,function (err, hash) {
			if(err){
				response = {"error" : true,"message" : "Error hashing password"};
				res.json(response);
			}
			else {
				db.userPassword = hash;
				
				db.save(function(err){
					// save() will run insert() command of MongoDB.
					// it will add new data in collection.
					if(err) {
						response = {"error" : true,"message" : "Error adding data"};
						res.json(response);
					} else {
						// response = {"error" : false,"message" : "Data added"};
						res.sendFile(path.join(__dirname + '/public/success-popup.html'));
					}
					// res.json(response);
				});
			}
		});
	});

// Login
router.route('/')
	.post([check('emailLogin').isEmail(), check('passwordLogin').isLength({min: 5})], function (req, res) {
		const errors = validationResult(req);
		console.log(req.body);
		if(!errors.isEmpty()){
			return res.status(422).jsonp(errors.array());
		}
		else {
			console.log('Let Login!');
		}
		
		var response = {};

		if (req.body.emailLogin && req.body.passwordLogin) {
			mongoOp.authenticate(req.body.emailLogin, req.body.passwordLogin, function (error, user) {
				if(error || !user){
					response = {"error" : true, 'status': 401, "message" : "Wrong email or password"};
					res.json(response);
				}
				else {
					// req.session.userId = user._id;
					res.sendFile(path.join(__dirname + '/public/home.html'));
				}
			});
		} else {
			response = {"error" : true, 'status': 400, "message" : "All fields are required!"};
			res.json(response);
		}
	});

// Get user by userEmail
router.route('/users/:userEmail')
	.get(function (req, res) {
		var response = {};
		
		mongoOp.find({ 'userEmail': req.params.email }, function (err, data) {
			if(err){
				response = {'error': true, 'message': 'Error fetching data for userEmail: ' + req.params.email};
			}
			else {
				response = {'error': false, 'message': data};
			}
			res.json(response);
		});
		
	});

// Get user by userId
router.route('/users/:id')
	.get(function (req, res) {
		var response = {};
		mongoOp.findById(req.params.id, function (err, data) {
			if(err){
				response = {'error': true, 'message': 'Error fetching data for id: ' + req.params.id};
			}
			else {
				response = {'error': false, 'message': data};
			}
			res.json(response);
		})
	})
	.put(function (req, res) {
		var response = {};
		mongoOp.findById(req.params.id, function (err, data) {
			if(err){
				response = {'error': true, 'message': 'Error updating data'};
			}
			else {
				if(req.body.email !== undefined){
					data.email = req.body.email;
				}
				if(req.body.password !== undefined){
					data.password = req.body.password;
				}
				data.save(function (err) {
					if(err){
						response = {'error': true, 'message': 'Error updating data'};
					}
					else {
						response = {'error': false, 'message': 'Data is updated for ' + req.params.id};
					}
					res.json(response);
				})
			}
		});
	})
	.delete(function (req, res) {
		var response = {};
		mongoOp.findById(req.params.id, function (err, data) {
			if(err){
				response = {'error': true, 'message': 'Error deleting data'};
			}
			else {
				mongoOp.remove({_id: req.params.id}, function (err) {
					if(err){
						response = {'error': true, 'message': 'Error deleting data'};
					}
					else {
						response = {'error': false, 'message': 'Data associated with ' + req.params.id + ' is deleted'};
					}
					res.json(response);
				})
			}
		})
	});

app.use('/', router);

app.listen(3000);
console.log('Listening to PORT 3000');
