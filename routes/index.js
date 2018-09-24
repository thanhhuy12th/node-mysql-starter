'use strict';

		// Logic
let 	userCtrl		= require('../controllers/user'),
		// Support
		config 			= require('../config/'),
		lib 			= require('../lib/'),
		libUpload		= require('../lib/upload'),
		logError		= require('../lib/logerror'),
		// Dependencies
		bodyParser 		= require('body-parser'),
		cors 			= require('cors'),
		path 			= require('path'),
		multer  		= require('multer'),
		md5  			= require('md5'),
		imageinfo 		= require('imageinfo'),
		Q 				= require('q'),
		serveIndex 		= require('serve-index');

let isAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	} else {
		res.end(401);
	}
}

let init = (app) => {
	app.post('/', isAuth, function(req, res){
		console.log("Login!");
	});
}

module.exports = init;
