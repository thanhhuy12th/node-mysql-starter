'use strict';
let 	Q 	= require('q'),
		fs 	= 	require('fs');

let readLog = () => {
	let q = Q.defer();
	let data;
	fs.readFile('log/error.log', function(err, buf) {
		if (err) {
			q.reject(err);
		}
		else{
			q.resolve(buf.toString() + " \n\n =======>  ");
		}
	});
	return q.promise;
}

let writeLog = (data) => {
	let q = Q.defer();
	fs.writeFile('log/error.log', data, function(err, data){
	    if (err) {
			q.reject(err);
		}
		else{
			q.resolve(1);
		}
	});
	return q.promise;
}

module.exports = {
	readLog,
	writeLog
}