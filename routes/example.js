'use strict';
		// Logic
let		expCtrl			= require('../controllers/example.js'),
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
	app.use('/api', isAuthRoutes);
	/*
		Example using multer to upload image
	 */
	 let storageImg = multer.memoryStorage({});
	 let create_something = multer({ 
	 	storage: storageImg,
	 	fileFilter: function (req, file, callback) {
	 		if(expCtrl.checkValidInputCreateSomething(req.body) == 400) {
	 			return callback(400, false);
	 		}
	 		let mime = file.mimetype;
	 		if(mime != "image/bmp" && mime != "image/jpeg" && mime != "image/tiff" && mime != "image/x-icon" && mime != "image/png") {
	 			return callback(400, false);
	 		}
	 		callback(null, true);
	 	},
	 	limits:{
	 		fileSize: 1024 * 2 * 1024
	 	}
	 }).single('default_img');
	isAuthRoutes.post('/create_something', (req, res) => {
		create_something(req,res,(callback) => {
			if(req.file){
				if(!callback){
					let imageInfo;
					let fileName 			= md5(Date.now() + lib.generateCodeLv2()) + ".jpg";
					let uploadPathRoot		= config.upload.itemUploadPathRoot;
					let uploadPath			= config.upload.itemUploadPath;
					let ipServerUpload		= config.upload.ipServerUpload;
					let portServerUpload	= config.upload.portServerUpload;
					let ipSave 				= ipServerUpload + ":" + portServerUpload + uploadPath;
					let buffer 				= req.file.buffer;
					libUpload.getInfoImage(buffer)
					.then((infoImg) => {
						imageInfo = infoImg;
						return libUpload.checkUploadAdvange(infoImg);
					})
					.then((result) => {
						return libUpload.compressImg(buffer, uploadPathRoot, imageInfo, fileName);
					})
					.then((resStore) => {
						return expCtrl.create_something(req.body,ipSave+fileName,req.decoded);
					})
					.then((result) => {
						res.json({data:{result:1, tour_detail:result}})
					})
					.catch((err) => {
						res.json({result: err});
					})
				}
				else{
					res.json({data:{result:callback}})
				}
			}
			else{
				if(callback == 400) {
					res.json({data:{result:400}})
				}
				else{
					let pathImgCreate = null;
					expCtrl.create_something(req.body,pathImgCreate,req.decoded)
					.then((data) => {
						res.json({data:{result:1, tour_detail:data}})
					})
					.catch((err) => {
						res.json({data:{result:err}})
					})
				}
			}
		});	
	});
	
	/*
		CREATE SIMPLE SOMETHING
	 */
	isAuthRoutes.post('/create_simple_something', (req, res) => {
		expCtrl.create_simple_something(req.body,req.decoded)
		.then((listPlan) => {
			res.json({data:{result:1,plan:listPlan}})
		})
		.catch((err) => {
			res.json({data:{result:err}})
		})
	});
	

}

module.exports = init;