'use strict';

let db	= require('../config/database');

// insert user by phone
// NO DELETE
let addUser = function (data, callback){
	return db.query("INSERT INTO users (username, password) VALUES (?,?)",[data.phone, data.password], callback);
}
// insert user by social
// NO DELETE
let addUserSocial = function (data, callback){
	return db.query("INSERT INTO users (id_social, id_social_type) VALUES (?,?)",[data.social_id, data.social_type], callback);
}
// insert profile
// NO DELETE
let addProfile = function (data, callback){
	return db.query("INSERT INTO profiles (id_user, full_name) VALUES (?,?)",[data.user_id, data.full_name], callback);
}
// Update user profile
// NO DELETE
let updateProfile = function (data, callback){
	return db.query("UPDATE profiles set full_name = ? where id_user = ?",[data.full_name,data.user_id], callback);
}
// Update user profile full
// NO DELETE
let updateProfileFull = function (data, callback){
	return db.query("UPDATE profiles set full_name = ?, gender=?, birthday=?, address=? where id_user = ?",[data.full_name,data.gender,data.birthday,data.address,data.user_id], callback);
}
// Update password
// NO DELETE
let updatePasswordById = function (data, callback){
	return db.query("UPDATE users SET password=?, action_time = NOW() WHERE id=?",[data.password, data.user_id], callback);
}
// Get user by id
// NO DELETE
let getUserById = function (user_id, callback) {
	return db.query("SELECT * FROM users WHERE id=?", [user_id], callback);
}
let getAllById = function (user_id, callback) {
	return db.query("SELECT profile.*, user.id as user_id, user.social_id, user.action_time, user.create_time, user.password, user.username, user.social_id, user.push_id FROM thshui_user user INNER JOIN thshui_profile profile ON user.id=profile.user_id WHERE user.id=? ORDER BY create_time DESC", [user_id], callback);
}
// Get user by username
// NO DELETE
let getUserByUsername = function (phone, callback) {
	return db.query("SELECT * FROM users WHERE username=? ORDER BY create_time DESC", [phone], callback);
}
// Get all by username
// NO DELETE
let getAllByUsername = function (phone, callback) {
	return db.query("SELECT u.*, p.full_name, p.gender, p.birthday, p.address FROM users u INNER JOIN profiles p ON u.id=p.id_user WHERE u.username=?", [phone], callback);
}
// Get all by social id
// NO DELETE
let getAllBySocial = function (social_id, callback) {
	return db.query("SELECT u.*, p.full_name, p.gender, p.birthday, p.address FROM users u INNER JOIN profiles p ON u.id=p.id_user WHERE u.id_social=?", [social_id], callback);
}
module.exports = { 
	addUser,
	addUserSocial,
	addProfile,
	updateProfile,
	updateProfileFull,
	updatePasswordById,
	getUserById,
	getAllById,
	getUserByUsername,
	getAllByUsername,
	getAllBySocial
};
