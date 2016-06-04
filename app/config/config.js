'use strict';

var conf = {
	NODE_ENV: 'production',
	PORT: 5000,
	SECRET: 'foobarbaz',
	SESSION_LENGTH: 3600000,
	TITLE: 'Sales Mapp',
	LOG_LEVEL: 'debug'
};

/**
 * Gets the configuration
 * @returns {Object}
 */
exports.get = function () {
	if (process.env.MONGOLAB_URI) {
		conf.MONGODB = process.env.MONGOLAB_URI;
	}

	return _.extend(conf, process.env);
};