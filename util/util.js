const chalk = require('chalk');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');
const NodeCache = require("node-cache");
const myCache = new NodeCache();

const ex = {};
//log constants
const loggerType = {
	"error": 1,
	"info": 2,
	"obj": 3
}
ex.logType = loggerType;

//logging
ex.log = function (type, ...msg) {

	if (type == 1) {
		console.log(chalk.red(msg))
	} else if (type == 2) {
		console.log(chalk.blue(msg))
	} else {
		console.log(msg)
	}
}

ex.getRandomId = function () {
	return uuidv4();
}

ex.registerRouters = function (server,direname) {
	fs
		.readdirSync(direname + '/router')
		.forEach(file => {
			var route = require(path.join(direname + '/router', file));
			server.route(route);
		});
}

ex.errorTemplate = function (err, code) {
	return { success: false, msg: err, code: code }
}

ex.checkBodyParams = function (expectedParams, payload) {
	let somethingMissing = undefined;
	expectedParams.forEach((param) => {

		if (payload == null || payload[param] == null || payload[param] == undefined) {
			somethingMissing = " " + param + " ";
		}
	})
	return somethingMissing;
}

ex.setCache = function (key, data, ttl) {
	if (ttl) {
		return myCache.set(key, data, ttl);
	} else {
		return myCache.set(key, data);
	}
}

ex.getCache = function (key) {
	let value = myCache.get(key);
	return value;
}

ex.roundNumber = function roundNumber(number) {

	const d = Math.pow(10, 1);
	return Math.round((number + Number.EPSILON) * d) / d;

}

ex.basciAuthValidate = async (request, username, password, h) => {

	let isValid=false;
	if(username == process.env.basic_auth_user && password == process.env.basic_auth_key){
		const credentials = {"valid":true };
		isValid=true;
		return { isValid, credentials };
	}else{
		const credentials = {"valid":false };
		return { isValid, credentials };
	}

};


ex.getWavHeader = function(header,  wavSize) {
	let headerSize = 44;
	header[0] = 'R';
	header[1] = 'I';
	header[2] = 'F';
	header[3] = 'F';
	let fileSize = wavSize + headerSize - 8;
	header[4] = (fileSize & 0xFF);
	header[5] = ((fileSize >> 8) & 0xFF);
	header[6] = ((fileSize >> 16) & 0xFF);
	header[7] = ((fileSize >> 24) & 0xFF);
	header[8] = 'W';
	header[9] = 'A';
	header[10] = 'V';
	header[11] = 'E';
	header[12] = 'f';
	header[13] = 'm';
	header[14] = 't';
	header[15] = ' ';
	header[16] = 0x10;
	header[17] = 0x00;
	header[18] = 0x00;
	header[19] = 0x00;
	header[20] = 0x01;
	header[21] = 0x00;
	header[22] = 0x01;
	header[23] = 0x00;
	header[24] = 0x80;
	header[25] = 0x3E;
	header[26] = 0x00;
	header[27] = 0x00;
	header[28] = 0x00;
	header[29] = 0x7D;
	header[30] = 0x00;
	header[31] = 0x00;
	header[32] = 0x02;
	header[33] = 0x00;
	header[34] = 0x10;
	header[35] = 0x00;
	header[36] = 'd';
	header[37] = 'a';
	header[38] = 't';
	header[39] = 'a';
	header[40] = (wavSize & 0xFF);
	header[41] = ((wavSize >> 8) & 0xFF);
	header[42] = ((wavSize >> 16) & 0xFF);
	header[43] = ((wavSize >> 24) & 0xFF);
  
  }

module.exports = ex;

