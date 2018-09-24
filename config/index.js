'use strict' ;
let 	os 				= require('os'),
		ifaces 			= os.networkInterfaces();
let init = () => {
	let __root 			= __dirname + "/..";
	let ipUpload;
	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				return;
			}
			if (alias >= 1) {
				ipUpload = iface.address;
			} else {
				ipUpload = iface.address;
			}
			++alias;
		});
	});
	return {
		PORT : 3000,
		jwt: {
			jwt_secret	: 	"'8>vc/yxT+3{Q*q!,*$U",
			jwt_time 	: 	60*60*24
		},
		sessionSecret	: 	"",
		facebook 		: 	{
			clientID	: 	"",
			clientSecret: 	"",
			callbackURL : 	"",
			profileField: 	["id" , "displayName" , "photos"]
		},
		botEmail: {
			username 	: "example@gmail.com",
			password	: "password",
			host 		: 'smtp.gmail.com',
			port 		: 587,
			secure 		: false,
			from 		: '"Hổ trợ <tourcarry@gmail.com>'
		},
		upload: {
			avatarTempPath			: __root + "/public/upload/img/avatar/",
			coverTempPath			: __root + "/public/upload/img/cover/",
			itemUploadPathRoot		: __root + "/public/upload/img/item/",
			avatarUploadPath		: "/upload/img/avatar/",
			coverUploadPath			: "/upload/img/cover/",
			itemloadPath			: "/upload/img/item/",
			maxSize 				: 25000 * 1024, // 20.000 kb
			portServerUpload		: 3000, // Now is current server, but future => config port another server upload here
			ipServerUpload			: ipUpload // Now is current server, but future => config ip another server upload here
		},
		oneSignal: {
			app_id			: "8a4a1323-3bb7-4da8-8ec3-0212e82280ae",
			Authorization	: "Basic NjZiYjc1YzgtOWFjMS00YTJlLTk5NDUtM2RmMzRlMzkzNjRh"
		}
	}

};
module.exports = init();