'use strict';

let db	= require('../config/database');

// insert tour
// NO DELETE
let addTour = function (data, callback){
	return db.query("INSERT INTO tour (user_id,title,mode,expect_start_time,location,img) VALUES (?,?,?,?,?,?)",[data.user_id,data.title,data.mode,data.start_time,data.location,data.default_img], callback);
}
// insert plan
// NO DELETE
let addPlan = function (data, callback){
	if(data.position == null){
		return db.query("INSERT INTO tour_plan (tour_id,title) VALUES (?,?)",[data.tour_id,data.title], callback);
	}
	else{
		return db.query("INSERT INTO tour_plan (tour_id,title,position) VALUES (?,?,?)",[data.tour_id,data.title,data.position], callback);
	}
}
// Get tour by id
// NO DELETE
let getTourById = function (id, callback){
	return db.query("SELECT * FROM tour WHERE id = ?",[id], callback);
}
// Get plan and detail by tour id
// NO DELETE
let getAllPlanAndDetailByTourId = function (id, callback){
	return db.query("SELECT p.*,d.id as detail_id,concat(d.location_x,',',d.location_y) as location,d.location_name,d.end_time,d.note,d.position as detail_position FROM tour_plan p LEFT JOIN tour_detail d ON p.id=d.plan_id WHERE p.tour_id = ? ORDER BY p.position ASC, p.id ASC, d.position ASC, d.id ASC",[id], callback);
}
module.exports = { 
	addTour,
	addPlan,
	getTourById,
	getAllPlanAndDetailByTourId
};
