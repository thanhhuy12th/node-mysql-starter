'use strict';
		// Logic
let 	userCtrl		= require('../controllers/user'),
		// Support
		config 			= require('../config/'),
		lib 			= require('../lib/'),
		libUpload		= require('../lib/upload'),
		logError		= require('../lib/logerror'),
		// Dependencies
		path 			= require('path'),
		multer  		= require('multer'),
		md5  			= require('md5'),
		imageinfo 		= require('imageinfo'),
		Q 				= require('q'),
		jwt   			= require('jsonwebtoken'),
		emailValid 		= require("email-validator"),
		express         = require('express');

let isAuthRoutes = express.Router(); 

let init = (app) => {
	isAuthRoutes.use(function(req, res, next) {
		let token = req.headers.authorization;
		if (token) {
			jwt.verify(token, config.jwt.jwt_secret, function(err, decoded) {			
				if (err) {
					return res.json({data:{result:401}});		
				} else {
					req.decoded = decoded;	
					next();
				}
			});
		} else {
			return res.json({data:{result:401}});
		}
	});
	//////////////////////////////////////////////////////// LOGIC ////////////////////////////////////////
	/*
		Register
	 */
	app.post('/register', function (req, res) {
		userCtrl.register(req.body)
		.then((result) => {
			res.json({data:{result:result}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
	// Log out
	app.post('/logout', (req, res) => {
		// code there
	});
	// Login normal
	app.post('/login', (req, res) => {
		userCtrl.login(req.body,jwt)
		.then((data) => {
			res.json({data:{result:1, token:data.token, profile:data.profile}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
	/*
		LOGIN BY FACEBOOK
	 */
	app.post('/login_facebook', (req, res) => {
		userCtrl.login_facebook(req.body,jwt)
		.then((token) => {
			res.json({data:{result:1, token:token}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
	/*
		LOGIN BY GOOGLE
	 */
	app.post('/login_google', (req, res) => {
		userCtrl.login_google(req.body,jwt)
		.then((token) => {
			res.json({data:{result:1, token:token}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
	//============================================ is auth plane ===========================
	app.use('/api', isAuthRoutes);
	/*
		UPDATE PROFILE
	 */
	isAuthRoutes.post('/update_profile', (req, res) => {
		userCtrl.update_profile(req.body,req.decoded)
		.then((profile) => {
			res.json({data:{result:1, profile:profile}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
	/*
		CHANGE PASSWORD
	 */
	isAuthRoutes.post('/change_password', (req, res) => {
		userCtrl.change_password(req.body,req.decoded)
		.then((result) => {
			res.json({data:{result:result}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
}

module.exports = init;
