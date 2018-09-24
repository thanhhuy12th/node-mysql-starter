'use strict';
let 	path 			= require('path'),
		Q				= require('q'),
		md5 			= require('md5'),
		fs 				= require('fs'),
		imageinfo 		= require('imageinfo'),
		im 				= require('imagemagick');
let		lib 			= require('./index'),
		config 			= require('../config/'),
		logError 		= require('./logerror');


/*
	SET SIZE IMAGE: Base on dimension and type and ratio to set new width, height for image.
	Return object with new width and height
	1. Using for loop to looping value from 800 to 8000 (50 ++ for 1 loop), ratio += 0.05
	2. If value <= i => demension.width/ratio and demension.height/ratio => break. If >= i => continue loop
	3. Return new dimension (width,height)
 */
let setSize = (dimension, value, type, ratio) => {
	let i;
	if(ratio == 1){
		let tmpRatio = 1;
		for(i = 800; i < 8000; i += 50){
			if(value <= i){
				dimension.width 	= Math.round(dimension.width / tmpRatio);
				dimension.height 	= Math.round(dimension.height / tmpRatio);
				break;
			}
			else tmpRatio += 0.05;
		}
	}
	else{
		let tmpRatio = 10;
		for(i = 8000; i < 40000; i += 50){
			if(value <= i){
				dimension.width 	= Math.round(dimension.width / tmpRatio);
				dimension.height 	= Math.round(dimension.height / tmpRatio);
				break;
			}
			else tmpRatio += 0.05;
		}
	}

	return dimension;
}

/*
	RESIZE IMAGE: base on width size or height size to resize, if w > h => use w, else use h
	1. set type to use (w or h) => type: width or height
	2. set value to check setSize function => value
	2. if dimension(w or h) < 800 => return resized (no resized)
	3. if dimension(w or h) > 800 and < 8000 => setSize(dimension,value,type,ratio) with ratio: 1 += 0.05
	4. if dimension(w or h) > 8000 => setSize(dimension,value,type,ratio) with ratio: 10 += 0.05
 */
let resizeImg = (imgObj) => {
	let type;
	let value;
	let resized 	= {};
	let dimension 	= {};

	dimension.width 	= imgObj.info.width;;
	dimension.height 	= imgObj.info.height;
	
	if(dimension.width > dimension.height){
		type 	= 'w';
		value 	= dimension.width;
	}
	else{
		type = 'h';
		value 	= dimension.height;
	}

	if(value < 800) resized = dimension;
	else if(value >= 800 && value < 8000) resized = setSize(dimension, value, type, 1);
	else resized = setSize(dimension, value, type, 10);

	return resized;
}

/*
	CALL TO USE IN ROUTE
 */

let getInfoImage = (buffer) => {
	let q 				= Q.defer();
	let imgObj 			= {};
	imgObj.info 		= imageinfo(buffer);
	imgObj.info.size 	= buffer.byteLength;
	q.resolve(imgObj);
	return q.promise;
}

let checkUploadAdvange = (imgObj) => {
	let q 		= Q.defer();
	if(imgObj.info.type == "image"){
		if(imgObj.info.size < config.upload.maxSize){
			q.resolve(1);
		}
		else{
			q.reject(400);
		}
	}
	else{
		q.reject(400);
		
	}
	return q.promise;
}
let compressImg = (buffer, uploadPath, imgObj, fileName) => {
	let q 			= Q.defer();
	let newResize 	= resizeImg(imgObj);
	im.resize({
		srcData: buffer,
		quality: 0.8,
		format: 'jpg',
		width: newResize.width,
		height: newResize.height
	}, function(err, stdout, stderr){
		if (err) q.reject(err);
		else{
			try{
				fs.writeFileSync(uploadPath + fileName, stdout, 'binary');
				q.resolve(1);
			}
			catch(err){
				console.log(err);
				q.reject(500);
			}
		}
	});
	return q.promise;
}
let copyImage = (path, Oldname) => {
	let q 					= Q.defer();
	let newName				= md5(Date.now() + lib.generateCodeLv2()) + ".jpg";
	let uploadPathRoot		= config.upload.tourUploadPathRoot;
	let uploadPath			= config.upload.tourUploadPath;
	let ipServerUpload		= config.upload.ipServerUpload;
	let portServerUpload	= config.upload.portServerUpload;
	let ipSave 				= ipServerUpload + ":" + portServerUpload + uploadPath;
	fs.readFile(path + Oldname, function (err, data) {
		if (err) q.reject(500);
		fs.writeFile(path + newName, data, function (err) {
			if (err) q.reject(500);
			else q.resolve(ipSave + newName);
		});
	});
	return q.promise;
}
let removeImage = (pathName) => {
	let q 			= Q.defer();
	fs.unlink(pathName, function(err) {
		if(err && err.code == 'ENOENT') {
	    // file doens't exist
		    q.reject(400);
		} else if (err) {
		    // other errors, e.g. maybe we don't have enough permission
		    console.log(err);
		    q.reject(500);
		} else {
			q.resolve(1);
		}
	});
	return q.promise;
}
module.exports = {
	getInfoImage,
	checkUploadAdvange,
	compressImg,
	removeImage,
	copyImage
}