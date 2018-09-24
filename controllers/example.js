'use strict';

let 	expMdl				= require('../models/example'),
		userCtrl			= require('../controllers/user'),
		lib					= require('../lib/'),
		libUpload			= require('../lib/upload'),
		mailer				= require('../lib/botmail'),
		config				= require('../config/'),
		logError			= require('../lib/logerror'),
		// dependencies
		moment				= require('moment'),
		Q 					= require('q'),
		bcrypt				= require('bcrypt-nodejs'),
		emailValid 			= require("email-validator"),
		request 			= require('request-promise'),  
		fetch 				= require('node-fetch'),  
		https  				= require('https'),
		util 				= require('util');
// ========== SUPPORT MAIN - CONNECT WITH MODEL LAYER ============
// Get tour by id
let getTourById = (id) => {
	let q = Q.defer();
	expMdl.getTourById(id, function(err, tour) {
		if(err) q.reject(err);
		else q.resolve(tour);
	});
	return q.promise;
}
// Get plan and detail by tour id
let getAllPlanAndDetailByTourId = (tour_id) => {
	let q = Q.defer();
	expMdl.getAllPlanAndDetailByTourId(tour_id, function(err, tour) {
		if(err) q.reject(err);
		else q.resolve(tour);
	});
	return q.promise;
}
// ADD TOUR
let addTour = (data) => {
	let q = Q.defer();
	expMdl.addTour(data, function(err, result) {
		if(err) q.reject(err);
		else q.resolve(result.insertId);
	});
	return q.promise;
}
// ADD PLAN
let addPlan = (data) => {
	let q = Q.defer();
	expMdl.addPlan(data, function(err, result) {
		if(err) q.reject(err);
		else q.resolve(1);
	});
	return q.promise;
}
// =========== LOGIN MAIN ================
/*
	CREATE SOMETHING
 */
let checkValidInputCreateSomething = (data) => {
	let location 	= data.location;
	let title 		= data.title;
	let mode 		= data.mode;
	let start_time 	= data.start_time;
	if(title == null || title.length < 3 || title.length > 150 || !lib.isValidLv3(title)){
		return 400;
	}
	else if(mode == null || !Number.isInteger(parseInt(mode)) || !lib.isValidLvPhone(mode) || mode < 0 || mode > 3) {
		return 400;
	}
	else if(start_time == null || (start_time.length > 0 && (!moment(start_time).isValid())) ){
		return 400;
	}
	else if (location == null) {
		return 400;
	}
	else{
		let bad = 0;
		location.forEach((item) => {
			if(!Number.isInteger(parseInt(item)) || !lib.isValidLvPhone(item) || item < 0 || item > 70 ) {
				bad ++;
			}
		});
		if(bad > 0) return 400;
		else return 1;
	}
}
let create_something = (data,path,decoded) => {
	let q 			= Q.defer();
	let user_id		= decoded.id;
	let location 	= data.location;
	let title 		= data.title;
	let mode 		= data.mode;
	let start_time 	= data.start_time;
	if(checkValidInputCreateTour(data) == 400){
		q.reject(400);
	}
	else{
		let tmpLocation = location.join();
		let tourData = {
			user_id:user_id,
			title:title,
			mode:mode,
			start_time:start_time,
			location:tmpLocation,
			default_img:path
		}
		addTour(tourData)
		.then((insertId) => {
			tourData.id 				= insertId;
			tourData.location 			= tmpLocation.split(",");
			tourData.expect_start_time 	= moment(start_time).format('DD/MM/YYYY HH:mm:ss');
			tourData.real_start_time 	= null;
			tourData.end_time 			= null;
			tourData.mode				= mode;
			tourData.status				= 0;
			q.resolve(tourData);
		})
		.catch((err) => {
			q.reject(500);
		})
	}
	return q.promise;
}

// ========= PLAN ==========
let convertListPlan = (planRespone) => {
	let plan 		= [];
	let detail 		= [];
	for(let i = 0; i < planRespone.length; i++) {
		let row 			= planRespone[i];
		let planData 		= {};
		let detailData 		= {};
		if(!row.detail_id){
			detail.push(detailData);
			planData.detail = detail;
		}
		else{
			detailData.id 				= row.detail_id;
			detailData.location			= row.location;	
			detailData.location_name	= row.location_name;	
			if(row.end_time == null){
				detailData.end_time 	= null;
			}
			else{
				detailData.end_time		= moment(row.end_time).format('DD/MM/YYYY HH:mm:ss');
			}
			detailData.note				= row.note;	
			detailData.position			= row.detail_position;	
			detail.push(detailData);
			planData.detail 			= detail;
		}
		if(!planRespone[i+1] || planRespone[i+1].id != row.id){
			planData.id 		= row.id;
			planData.title 		= row.title;
			planData.position 	= row.position;
			plan.push(planData);
			detail = [];
		}
	};
	return plan;
}
/*
	CREATE SIMPLE SOMETHING
 */
let create_simple_something = (data,decoded) => {
	let q 			= Q.defer();
	let user_id		= decoded.id;
	let tour_id		= data.tour_id;
	let title		= data.title;
	if(!tour_id || !lib.isValidLvPhone(tour_id) || !Number.isInteger(parseInt(tour_id)) || tour_id.toString().length <= 0 || tour_id.toString().length > 36){
		q.reject(400);
	}
	else if(!title || title.length < 3 || title.length > 150 || !lib.isValidLv3(title) ){
		q.reject(400);
	}
	else{
		getTourById(tour_id)
		.then((tourRespone) => {
			if(!tourRespone[0]) throw 401;
			else if(tourRespone[0].user_id != user_id) throw 401;
			else{
				let planDataSend = {
					tour_id: tour_id,
					title: title,
				}
				return addPlan(planDataSend);
			}
		})
		.then((res) => {
			return getAllPlanAndDetailByTourId(tour_id);
		})
		.then((planRespone) => {
			let plan = convertListPlan(planRespone);
			q.resolve(plan);
		})
		.catch((err) => {
			if (Number.isInteger(parseInt(err))) {
				q.reject(err);
			}
			else {
				console.log(err);
				q.reject(500);
			}
		})
	}
	return q.promise;
} 
module.exports = {
	create_something,
	create_simple_something,
	checkValidInputCreateSomething,
}