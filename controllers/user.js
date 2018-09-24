'use strict';

let 	userMdl				= require('../models/user'),
		lib					= require('../lib/'),
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
		https  				= require('https');
/*
	============== SUPPORT FOR MAIN =================
 */
// Get data by id
// NO DELETE
let getUserById = (_id) => {
	let q = Q.defer();
	userMdl.getUserById(_id, function(err, user) {
		if (err) {
			q.reject(err);
		}
		else{
			q.resolve(user);
		}
	});
	return q.promise;
}
// Get data by username
// NO DELETE
let getUserByUsername = (phone) => {
	let q = Q.defer();
	userMdl.getUserByUsername(phone, function(err, user) {
		if(err) q.reject(err);
		else q.resolve(user);
	});
	return q.promise;
}
// Get user and profile data by username
// NO DELETE
let getAllByUsername = (phone) => {
	let q = Q.defer();
	userMdl.getAllByUsername(phone, function(err, user) {
		if(err) q.reject(err);
		else q.resolve(user);
	});
	return q.promise;
}
// Get user and profile data by social id
// NO DELETE
let getAllBySocial = (social_id) => {
	let q = Q.defer();
	userMdl.getAllBySocial(social_id, function(err, user) {
		if(err) q.reject(err);
		else q.resolve(user);
	});
	return q.promise;
}
// add user
// NO DELETE
let addUser = (data) => {
	let q = Q.defer();
	userMdl.addUser(data, function(err, result) {
		if(err) q.reject(err);
		else q.resolve(result.insertId);
	});
	return q.promise;
}
// add user social
// NO DELETE
let addUserSocial = (data) => {
	let q = Q.defer();
	userMdl.addUserSocial(data, function(err, result) {
		if(err) q.reject(err);
		else q.resolve(result.insertId);
	});
	return q.promise;
}
// add profile
// NO DELETE
let addProfile = (data) => {
	let q = Q.defer();
	userMdl.addProfile(data, function(err) {
		if(err) q.reject(err);
		else q.resolve(1);
	});
	return q.promise;
}
// update profile
// NO DELETE
let updateProfile = (data) => {
	let q = Q.defer();
	userMdl.updateProfile(data, function(err) {
		if(err) q.reject(err);
		else q.resolve(1);
	});
	return q.promise;
}
// update profile full
// NO DELETE
let updateProfileFull = (data) => {
	let q = Q.defer();
	userMdl.updateProfileFull(data, function(err) {
		if(err) q.reject(err);
		else q.resolve(1);
	});
	return q.promise;
}
// Update password
// NO DELETE
let updatePasswordById = (data) => {
	let q = Q.defer();
	userMdl.updatePasswordById(data, function(err) {
		if(err) q.reject(err);
		else q.resolve(1);
	});
	return q.promise;
}
//Encrypt password
//NO DELETE
let encryptPassword = (password) => {
	let q = Q.defer();
	let SALT = 10;
	let newHash;
	// Tạo salt
    bcrypt.genSalt(SALT, function(err, salt) {
        if (err) q.reject(err);
        // Hash pass với salt
        bcrypt.hash(password, salt, null, function(err, hash) {
            if (err) q.reject(err);
            else{
            	q.resolve(hash)
            }
        });
    });
    return q.promise;
}
// validate password
// NO DELETE
let validatePassword = (password, hash) => {
	let q = Q.defer();
	bcrypt.compare(password, hash, function(err, res) {
    	if (err) {
			q.reject(err);
		}
		else{
			q.resolve(res);
		}
	});
	return q.promise;
}
// Generate JWT
// NO DELETE
let generateJwt = (jwt,data) => {
	let q = Q.defer();
	let payload = {
		id: data.id,	
		username: data.username,	
		full_name: data.full_name,	
		birthday: data.birthday,	
		gender: data.gender,	
		address: data.address,	
		user_type: data.user_type,	
	}
	let token = jwt.sign(payload, config.jwt.jwt_secret, {
					expiresIn: config.jwt.jwt_time
				});
	let dataRespone = {};
	dataRespone.token	= token;
	dataRespone.profile	= payload;
	q.resolve(dataRespone);
	return q.promise;
}
/*
	====================== HANDLE WITH ROUTE PLACE ==================
 */
/*
	REGISTER
	1. Check valid input, return 400 if bad request
	2. Check phone is not exist, if exist return 10
	3. add data to user data
	4. add data to profile data
	5. return 1 iff success, 500 if error server
 */
let register = (data) => {
	let User = {};
	let q = Q.defer();
	let phone 				= data.phone;
	let password 			= data.password;
	let password_confirm 	= data.password_confirm;
	let full_name 			= data.full_name;
	let agree 				= data.agree;
	if(phone == null || password == null || phone.length < 6 || password.length < 6 || phone.length > 20 || password.length > 30 || !lib.isValidLvPhone(phone)){
		q.reject(400);
	}
	else if(password != password_confirm){
		q.reject(400);
	}
	else if(full_name == null || full_name.length < 3 || full_name.length > 100 || !lib.isValidLv3(full_name)){
		q.reject(400);
	}
	else if (!Number.isInteger(parseInt(agree)) || !lib.isValidLv0(agree) ){
		q.reject(400);
	}
	else if (agree != 1 ){
		q.reject(400);
	}
	else {
		getUserByUsername(phone)
		.then(function(res){
			if(res.length == 0){
				User.phone				= phone;
				return encryptPassword(password);
			}
			else{
				throw 10
			}
		})
		.then((res) => {
			User.password = res;
			return addUser(User);
		})
		.then((user_id) => {
			User.user_id 	= user_id;
			User.full_name 	= full_name;
			return addProfile(User);
		})
		.then((res) => {
			q.resolve(res);
		})
		.catch(function(err){
			if (Number.isInteger(parseInt(err))) {
				q.reject(err);
			}
			else {
				q.reject(500);
			}
		})
	}
	return q.promise;
}
/*
	LOGIN
	1. Check valid input, return 400 if bad request
	2. Check phone is not exist, if exist return 401
	3. Check password is match, if not return 401
	4. Sign JWT
	5. return token if success, 500 if error server
 */
let login = (data,jwt) => {
	let q 			= Q.defer();
	let userData	= {};
	let phone 		= data.phone;
	let password 	= data.password;
	if(phone == null || password == null || phone.length < 6 || password.length < 6 || phone.length > 20 || password.length > 30 || !lib.isValidLvPhone(phone)){
		q.reject(400);
	}
	else {
		getAllByUsername(phone)
		.then((user) => {
			if(!user[0]) {
				throw 401;
			}
			else {
				userData = user[0];
				return validatePassword(password, user[0].password);
			}
		})
		.then((isMatch) => {
			if(!isMatch){
				throw 401;
			}
			else {
				userData.user_type 	= "normal";
				return generateJwt(jwt,userData);
			}
		})
		.then((dataRespone) => {
			q.resolve(dataRespone);
		})
		.catch((err) => {	
			if (Number.isInteger(parseInt(err))) {
				q.reject(err);
			}
			else {
				q.reject(500);
			}
		})
	}
	return q.promise;
}
/*
	LOGIN SOCIAL FACEBOOK
	1. Receive AToken
	2. Verify AToken with FB -> post
	3. Receive profile ->
	- Check id_social
		+ not exist:
			* add to DB (user and profile)
			* done
		+ exist -> check is change profile ? 
			* if yes -> update profile and done
			* if not -> done
	4. Generate profile to JWT
	5. Send JWT to client
 */
let login_facebook = (data,jwt) => {
	let q 				= Q.defer();
	let access_token	= data.access_token;
	// global variable
	let UserData 		= {};
	let profilesData 	= {};
	if(access_token == null || access_token.length < 1 || access_token.length > 500 || !lib.isValidLv2(access_token)){
		q.reject(400);
	}
	else{
		// 1. Verify access token
		verify_facebook(access_token)
		.then((profilesRespone) => {
			if(!profilesRespone.id || !profilesRespone.name){
				throw 401
			}
			else{
				profilesData = profilesRespone;
				return getAllBySocial(profilesRespone.id);
			}
		})
		.then((user) => {
			if(user[0]) {
				// check is change profile
				if(user[0].full_name == profilesData.name){
					//Generate profile to JWT
					let payload = {
						id: user[0].id,	
						social_id: user[0].social_id,	
						full_name: user[0].full_name,	
						birthday: null,	
						gender: null,	
						address: null,
						user_type: "social"	
					}
					generateJwt(jwt,payload)
					.then((dataRespone) => {
						q.resolve(dataRespone);
					})
					.catch((err) => {
						if (Number.isInteger(parseInt(err))) {
							q.reject(err);
						}
						else {
							q.reject(500);
						}
					})
				}
				else{
					UserData.full_name 	= profilesData.name;
					UserData.user_id	= user[0].id;
					updateProfile(UserData)
					.then((res) => {
						//Generate profile to JWT
						let payload = {
							id: user[0].id,	
							social_id: user[0].social_id,	
							full_name: profilesData.name,	
							birthday: null,	
							gender: null,	
							address: null,	
							user_type: "social",	
						}
						return generateJwt(jwt,payload);
					})
					.then((dataRespone) => {
						q.resolve(dataRespone);
					})
					.catch((err) => {
						if (Number.isInteger(parseInt(err))) {
							q.reject(err);
						}
						else {
							q.reject(500);
						}
					})
				}
			}
			else{
				// add to DB (user and profile)
				UserData.social_id 		= profilesData.id;
				UserData.social_type 	= 0;
				addUserSocial(UserData)
				.then((lastUserId) => {
					UserData.user_id 	= lastUserId;
					UserData.full_name 	= profilesData.name;
					return addProfile(UserData);
				})
				.then((res) => {
					//Generate profile to JWT
					let payload = {
						id: UserData.user_id,	
						social_id: UserData.social_id,	
						full_name: UserData.full_name,	
						birthday: null,	
						gender: null,	
						address: null,
						user_type: "social"	
					}
					return generateJwt(jwt,payload);
				})
				.then((dataRespone) => {
					q.resolve(dataRespone);
				})
				.catch((err) => {
					if (Number.isInteger(parseInt(err))) {
						q.reject(err);
					}
					else {
						q.reject(500);
					}
				})
			}
		})
		.catch((err) => {
			if (Number.isInteger(parseInt(err))) {
				q.reject(err);
			}
			else {
				q.reject(500);
			}
		})
	}
	return q.promise;
}
// Support login social
// Verify social
// NO DELETE
let verify_facebook = (access_token) => {
	let q 	= Q.defer();
	fetch('https://graph.facebook.com/v2.5/me?fields=email,name&access_token=' + access_token)
	.then((response) => { return response.json() })
	.then((json) => {
		q.resolve(json);       
	})
	.catch((err) => {
		q.reject(401);
	})
	return q.promise;
}
/*
	LOGIN SOCIAL GOOGLE
	1. Receive AToken
	2. Verify AToken with FB -> post
	3. Receive profile ->
	- Check id_social
		+ not exist:
			* add to DB (user and profile)
			* done
		+ exist -> check is change profile ? 
			* if yes -> update profile and done
			* if not -> done
	4. Generate profile to JWT
	5. Send JWT to client
 */
let login_google = (data,jwt) => {
	let q 				= Q.defer();
	let access_token	= data.access_token;
	// global variable
	let UserData 		= {};
	let profilesData 	= {};
	if(access_token == null || access_token.length < 1 || access_token.length > 500 || !lib.isValidLv2(access_token)){
		q.reject(400);
	}
	else{
		// 1. Verify access token
		verify_google(access_token)
		.then((profilesRespone) => {
			if(profilesRespone.error || !profilesRespone.id || !profilesRespone.name){
				throw 401;
			}
			else{
				profilesData = profilesRespone;
				return getAllBySocial(profilesRespone.id);
			}
		})
		.then((user) => {
			if(user[0]) {
				// check is change profile
				if(user[0].full_name == profilesData.name){
					//Generate profile to JWT
					let payload = {
						id: user[0].id,	
						social_id: user[0].social_id,	
						full_name: user[0].full_name,	
						birthday: null,	
						gender: null,	
						address: null,
						user_type: "social"	
					}
					generateJwt(jwt,payload)
					.then((dataRespone) => {
						q.resolve(dataRespone);
					})
					.catch((err) => {
						if (Number.isInteger(parseInt(err))) {
							q.reject(err);
						}
						else {
							q.reject(500);
						}
					})
				}
				else{
					UserData.full_name 	= profilesData.name;
					UserData.user_id	= user[0].id;
					updateProfile(UserData)
					.then((res) => {
						//Generate profile to JWT
						let payload = {
							id: user[0].id,	
							social_id: user[0].social_id,	
							full_name: profilesData.name,	
							birthday: null,	
							gender: null,	
							address: null,
							user_type: "social"	
						}
						return generateJwt(jwt,payload);
					})
					.then((dataRespone) => {
						q.resolve(dataRespone);
					})
					.catch((err) => {
						if (Number.isInteger(parseInt(err))) {
							q.reject(err);
						}
						else {
							q.reject(500);
						}
					})
				}
			}
			else{
				// add to DB (user and profile)
				UserData.social_id 		= profilesData.id;
				UserData.social_type 	= 1;
				addUserSocial(UserData)
				.then((lastUserId) => {
					UserData.user_id 	= lastUserId;
					UserData.full_name 	= profilesData.name;
					return addProfile(UserData);
				})
				.then((res) => {
					//Generate profile to JWT
					let payload = {
						id: UserData.user_id,	
						social_id: UserData.social_id,	
						full_name: UserData.full_name,	
						birthday: null,	
						gender: null,	
						address: null,
						user_type: "social"	
					}
					return generateJwt(jwt,payload);
				})
				.then((dataRespone) => {
					q.resolve(dataRespone);
				})
				.catch((err) => {
					if (Number.isInteger(parseInt(err))) {
						q.reject(err);
					}
					else {
						q.reject(500);
					}
				})
			}
		})
		.catch((err) => {
			if (Number.isInteger(parseInt(err))) {
				q.reject(err);
			}
			else {
				q.reject(500);
			}
		})
	}
	return q.promise;
}
// Support login social
// Verify social
// NO DELETE
let verify_google = (access_token) => {
	let q 	= Q.defer();
	fetch('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + access_token)
	.then((response) => { return response.json() })
	.then((json) => {
		q.resolve(json);       
	})
	.catch((err) => {
		q.reject(401);
	})
	return q.promise;
}
/*
	UPDATE PROFILE
	1. Check valid input, return 400 if bad request
	2. Check user_type, return 402 if user_type = "social"
	3. Update profile
	4. Return result if success, 500 if error server
 */
let update_profile = (data,decoded) => {
	let q 			= Q.defer();
	let user_id		= decoded.id;
	let user_type	= decoded.user_type;
	let full_name	= data.full_name;
	let address		= data.address;
	let gender		= data.gender;
	let birthday	= data.birthday;
	if(full_name== null || full_name.length < 3 || full_name.length > 100 || !lib.isValidLv2(full_name)){
		q.reject(400);
	}
	else if(address == null || (address.length > 0 && (!lib.isValidLv3(address) || address.length > 150 || address.length < 3)) ){
		q.reject(400);
	}
	else if(gender == null || !Number.isInteger(parseInt(gender)) || !lib.isValidLvPhone(gender) || parseInt(gender) < 0 || parseInt(gender) > 2){
		q.reject(400);
	}
	else if(birthday == null || !moment(birthday).isValid()) {
		q.reject(400);
	}
	else{
		if(user_type == "social") throw 402;
		else{
			let userData = {
				user_id:user_id,
				full_name:full_name,
				address:address,
				gender:gender,
				birthday:birthday
			}
			updateProfileFull(userData)
			.then((res) => {
				q.resolve(userData);
			})
			.catch((err) => {
				if (Number.isInteger(parseInt(err))) {
					q.reject(err);
				}
				else {
					q.reject(500);
				}
			})
		}
	}
	return q.promise;
}
/*
	CHANGE PASS
	1. Check input valid, return 400 if not
	2. Check valid old password with user id, return 401 if not
	3. Change password
	4. Return 1 if success, 500 if error code
 */
let change_password = (data,decoded) => {
	let q = Q.defer();
	let user_id 			= decoded.id;
	let user_type 			= decoded.user_type;
	let old_pass			= data.old_pass;
	let new_pass			= data.new_pass;
	let new_pass_confirm	= data.new_pass_confirm;
	// Check valid input
	if (old_pass == null || new_pass == null || new_pass_confirm == null || old_pass.length < 6 ||  old_pass.length > 30 || new_pass.length < 6 ||  new_pass.length > 30 || new_pass_confirm.length < 6 ||  new_pass_confirm.length > 30){
		q.reject(400);
	}
	else if (new_pass != new_pass_confirm){
		q.reject(400);
	}
	else if(user_type == "social") {
		q.reject(402);
	}
	else{
		// Check valid old password
		getUserById(user_id)
		.then((userRespone) => {
			if(!userRespone[0]){
				throw 401;
			}
			else{
				let hash = userRespone[0].password;
				return validatePassword(old_pass,hash);
			}
		})
		.then((isMatch) => {
			if(isMatch){
				return encryptPassword(new_pass);
			}
			else {
				throw 401;
			}
		})
		.then((hashNew) => {
			// Change password
			let updatePassword = {
				user_id:user_id,
				password:hashNew
			};
			return updatePasswordById(updatePassword);
		})
		.then((res) => {
			q.resolve(res);
		})
		.catch(function(err){
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
	getUserById,
	getUserByUsername,
	validatePassword,
	register,
	login,
	login_facebook,
	login_google,
	update_profile,
	change_password,
}