/*
 * 
 */

'use strict';

/**
 * Reads the configuration file.
 * @returns {Object} The configuration.
 */
exports.read = function () {
	// TODO - If we ever want to allow reloading, we will need to actually read this rather than require it.
	var config = require('./config.json');

	config.environment = config.environment || process.env.NODE_ENV;

	return config;
};
