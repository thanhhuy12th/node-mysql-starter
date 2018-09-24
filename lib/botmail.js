'use strict';
let 	nodeMailer 		= require('nodemailer'),
		smtpTransport 	= require('nodemailer-smtp-transport'),
		Q 				= require('q'),
		config 			= require('../config/');

let init = (to,subject,text,html) => {

	let q = Q.defer();

	let host 	= config.botEmail.host;
	let port 	= config.botEmail.port;
	let secure 	= config.botEmail.secure;
	let user 	= config.botEmail.username;
	let pass 	= config.botEmail.password;
	let from 	= config.botEmail.from;


	let transporter = nodeMailer.createTransport(smtpTransport({
		host: host,
		port: port,
		secure: secure,
		auth: {
			user: user,
			pass: pass
		}
	}));
	let mailOptions = {
		from: from, // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		text: text, // plain text body
		html: html // html body
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			q.reject(err);
		}
		else{
			q.resolve(1);
		}
	});
	return q.promise;
}

module.exports = init;