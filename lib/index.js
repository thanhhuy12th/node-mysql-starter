'use strict';
let 	path 			= require('path'),
		os 				= require('os'),
		ifaces 			= os.networkInterfaces();
// Convert to Vietnamese
let convertToVN = (string) => {
	let str = string;
	str = str.toLowerCase();
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
	str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
	str = str.replace(/đ/g,"d");
	str = str.trim(); 
	return str;
}
// Maximum valid - only Alphabet and number
let isValidLv0 = (string) => {
	return string.match(/^[a-zA-Z0-9]+$/) ? true : false;
}
// Lv1 - only Alphabet and number and @, .
let isValidLv1 = (string) => {
	return string.match(/^[a-zA-Z0-9@._]+$/) ? true : false;
}
// Lv2 - only Alphabet and number and '@' , '.' , ' ','-'
let isValidLv2 = (string) => {
	let input = convertToVN(string);
	return input.match(/^[a-zA-Z0-9@._,: -]+$/) ? true : false;
}
// Lv3 - only Alphabet and number and '@' , '.' , ' ','-', tab, newline,  carriage return
let isValidLv3 = (string) => {
	let input = convertToVN(string);
	return input.match(/^[a-zA-Z0-9@.,!?:\-_/ \\\n]+$/) ? true : false;
}
// Lv Phone - Only number and +
let isValidLvPhone = (string) => {
	return string.match(/^[0-9]+$/) ? true : false;
} 
let makeValidDate = (string) => {
	if(string.toString().length == 1){
		return "0" + string;
	}
	return string;
}

// Generate code 
let generateCode = () => {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 7; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}
let generateCodeLv2 = () => {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 16; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}
let generateCodeSearch = () => {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	for (let i = 0; i < 8; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}


module.exports = {
	isValidLv0,
	isValidLv1,
	isValidLv2,
	isValidLv3,
	isValidLvPhone,
	makeValidDate,
	generateCode,
	generateCodeLv2,
	generateCodeSearch
}