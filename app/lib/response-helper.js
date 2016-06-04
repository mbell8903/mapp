/*
 *
 */

'use strict';

/**
 * Returns a JSON structure used for success responses
 * @param {String} message The message to send to the client
 * @param {Object} [data] Additional carrier data to send to the client
 * @returns {{code: string, message: *, data: {}}}
 */
exports.ok = function (message, data) {
	return exports.custom('OK', message, data);
};

/**
 * Returns a JSON structure used for custom responses
 * @param {String} code The HTTP code (in text not a number) to send
 * @param {String} message The message to send to the client
 * @param {Object} [data] Additional carrier data to send to the client
 * @returns {{code: *, message: *, data: {}}}
 */
exports.custom = function (code, message, data) {
	return {
		code: code,
		message: message,
		data: !data ? {} : data
	};
};

/**
 * Returns a JSON structure used for error responses
 * @param {String} code The HTTP code (in text not a number) to send
 * @param {String} message The message to send to the client
 * @returns {{code: *, message: *}}
 */
exports.error = function (code, message) {
	return {
		code: code,
		message: message
	};
};
