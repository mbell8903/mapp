/*
 * Copyright (C) 2015 TeraLogics, LLC. All Rights Reserved.
 */

'use strict';

var moment = require('moment'),
	stream = require('stream'),
	util = require('util'),
	syslog = null,
	syslogFacilities = null,
	syslogFacilityKeywords = null,
	severity = {
		alert: 1,
		crit: 2,
		critical: 2,
		error: 3,
		warning: 4,
		warn: 4,
		notice: 5,
		info: 6,
		debug: 7
	},
	rc = console,
	streams = {};

try {
	syslog = require('node-syslog');
	// Save the valid facilities as a map for validation.
	syslogFacilities = [
		syslog.LOG_KERN,
		syslog.LOG_USER,
		syslog.LOG_MAIL,
		syslog.LOG_DAEMON,
		syslog.LOG_AUTH,
		syslog.LOG_SYSLOG,
		syslog.LOG_LPR,
		syslog.LOG_NEWS,
		syslog.LOG_UUCP,
		syslog.LOG_LOCAL0,
		syslog.LOG_LOCAL1,
		syslog.LOG_LOCAL2,
		syslog.LOG_LOCAL3,
		syslog.LOG_LOCAL4,
		syslog.LOG_LOCAL5,
		syslog.LOG_LOCAL6,
		syslog.LOG_LOCAL7
	].reduce(function(memo, facility) {
		// Convert the array into a
		memo[facility] = true;
		return memo;
	}, {});
	// Save a map from keyword to facility code.
	syslogFacilityKeywords = {
		kern: syslog.LOG_KERN,
		user: syslog.LOG_USER,
		mail: syslog.LOG_MAIL,
		daemon: syslog.LOG_DAEMON,
		auth: syslog.LOG_AUTH,
		syslog: syslog.LOG_SYSLOG,
		lpr: syslog.LOG_LPR,
		news: syslog.LOG_NEWS,
		uucp: syslog.LOG_UUCP,
		local0: syslog.LOG_LOCAL0,
		local1: syslog.LOG_LOCAL1,
		local2: syslog.LOG_LOCAL2,
		local3: syslog.LOG_LOCAL3,
		local4: syslog.LOG_LOCAL4,
		local5: syslog.LOG_LOCAL5,
		local6: syslog.LOG_LOCAL6,
		local7: syslog.LOG_LOCAL7
	};
} catch (e) {
	if (e.code !== 'MODULE_NOT_FOUND') {
		throw e;
	}
}

/**
 * Return the first argument that is not undefined
 * @private
 */
function _firstDefined() {
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] !== 'undefined') {
			return arguments[i];
		}
	}
}

/**
 * Gets the one-character identifier for `level`.
 * @param {Number} level The log level.
 * @returns {String} The identifier.
 * @private
 */
function _getLevelChar(level) {
	switch (level) {
		case 1:
			return 'A';
		case 2:
			return 'C';
		case 3:
			return 'E';
		case 4:
			return 'W';
		case 5:
			return 'N';
		case 6:
			return 'I';
		default:
			return 'D';
	}
}

/**
 * Output `msg` at `level`.
 * @param {String} level The log level.
 * @param {String} msg The message.
 * @private
 */
function _output(level, msg) {
	var sev = severity[level];

	if (rc.level >= sev) {
		var formattedMessage = util.format(
			'%s %s[%s] %s | %s',
			moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
			rc.title,
			('     ' + process.pid).slice(-5),
			_getLevelChar(sev),
			msg
		);

		console.log(formattedMessage);

		if (syslog) {
			syslog.log(Math.min(sev, syslog.LOG_DEBUG), formattedMessage);
		}
	}
}

// Set up all of the convenience log-level functions on console.
Object.keys(severity).forEach(function (level) {
	rc[level] = function () {
		_output(level, util.format.apply({}, arguments));
	};
});

/**
 * Set up `options` and connect to syslog.
 * @param {Object} [options] The options.
 * @param {String} [options.title] The application title.
 * @param {String} [options.level] The minimum log level to output.
 * @param {String|Number} [options.facility] The syslog facility to which to log, if syslog is available.
 */
rc.set = function (options) {
	options = _firstDefined(options, {});
	rc.title = _firstDefined(options.title, rc.title, process.title);
	rc.level = severity[_firstDefined(options.level, rc.level, 'info')];

	if (syslog) {
		// If syslog is available, process the facility option.
		rc.facility = _firstDefined(options.facility, rc.facility, syslog.LOG_LOCAL3);

		switch (typeof rc.facility) {
			case 'number':
				// If it's a number, make sure it's one of the valid facility codes.
				if (!syslogFacilities[rc.facility]) {
					rc.facility = null;
				}
				break;
			case 'string':
				// If it's a string, make sure it's a valid facility keyword.
				rc.facility = syslogFacilityKeywords[rc.facility.toLowerCase()];
				break;
		}

		if (!rc.facility) {
			// If either of those didn't produce a facility, fall back on the default again.
			rc.facility = syslog.LOG_LOCAL3;
		}

		syslog.close();
		/* jshint -W016 */ // bitwise is intended here
		syslog.init(rc.title, (syslog.LOG_PID | syslog.LOG_ODELAY), rc.facility);
		/* jshint +W016 */
	}
};

/**
 * Return a writable stream for `level`
 * @param {String} level The log level.
 * @return {Stream} A stream for `level`.
 */
rc.stream = function (level) {
	if (streams[level]) {
		return streams[level];
	} else {
		streams[level] = new stream.Stream();
		streams[level].writable = true;
		streams[level].write = rc[level];

		return streams[level];
	}
};

rc.set();

module.exports = rc;
