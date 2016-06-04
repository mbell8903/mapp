/*
 *
 */

'use strict';

/**
 * Logs various types of errors
 * @param {*|Function|Object} err The error to log.
 * @param {Function} [logger] The function that logs the error.
 * @returns {Function|undefined} Either a new logging function using `logger`; or, undefined.
 */
exports.logError = function (err, logger) {
	if (err === undefined || err === null) {
		console.error('Undefined or null logged', (new Error()).stack);
		return;
	}

	if (typeof err === 'function') {
		// Deferred passing of error, return a function to handle it
		return function (error) {
			err(error.fullStack || error.stack || error);
		};
	} else {
		if (logger && typeof logger === 'function') {
			logger(err.fullStack || err.stack || err);
		} else {
			console.error(err.fullStack || err.stack || err);
		}
	}
};
