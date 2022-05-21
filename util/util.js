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

ex.registerRouters = function (server) {
	fs
		.readdirSync(__dirname + '/router')
		.forEach(file => {
			var route = require(path.join(__dirname + '/router', file));
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

module.exports = ex;

