/*
 * Copyright (C) 2015 EB's, LLC. All Rights Reserved.
 */

'use strict';

var moment = require('moment'),
	/* global -Promise */ // Indicate that we actually do intend to shadow the ES6 Promise global.
	Promise = require('bluebird'),
	util = require('util');

var REGEX_INT = /^-?\d+$/,
	REGEX_FLOAT = /^-?\d*(?:\.(?:\d+)?)?$/,
	REGEX_BOOL = /^(?:t|f|true|false|0|1)$/i,
	REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	REGEX_PW_LOWERCASE = /[a-z]/g,
	REGEX_PW_UPPERCASE = /[A-Z]/g,
	REGEX_PW_NUMBERS = /[0-9]/g,
	REGEX_PW_SPECIAL = /[`~!@#$%\^&*()_\-=+\\|{}\[\]'";:<.>\/?,]/g,
	REGEX_HEXCOLOR = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
	REGEX_OBJECTID = /^[0-9a-fA-F]{24}$/,
	octet = '(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])',
	REGEX_IP = new RegExp('^' + octet + '\.' + octet + '\.' + octet + '\.' + octet + '$'),
	REGEX_HOST = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/,
	PASSWORD_COMPLEXITY_PARAMETERS = {
		characters: {
			description: 'character(s)',
			evaluate: function (password) {
				return password.length;
			}
		},
		lowercase: {
			description: 'lower-case character(s)',
			evaluate: REGEX_PW_LOWERCASE
		},
		uppercase: {
			description: 'upper-case character(s)',
			evaluate: REGEX_PW_UPPERCASE
		},
		numbers: {
			description: 'number(s)',
			evaluate: REGEX_PW_NUMBERS
		},
		special: {
			description: 'special character(s)',
			evaluate: REGEX_PW_SPECIAL
		}
	};

/**
 * Determines whether `val` is or can be converted to a Boolean value.
 * @param {Boolean|String|Number} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to a Boolean value; otherwise, `false`.
 */
exports.boolean = function (val) {
	// Non-boolean values are accepted because they can be converted to booleans
	if (_.isBoolean(val)) {
		return true;
	} else if (_.isString(val)) {
		return exports.custompattern(val, REGEX_BOOL);
	} else if (_.isNumber(val)) {
		return exports.intinrange(val, 0, 1);
	} else {
		return false;
	}
};

/**
 * Determines whether `val` matches the supplied regular expression, `pattern`.
 * @param {String} val The value.
 * @param {RegExp|String} pattern The pattern.
 * @returns {Boolean} `true` if it matches; otherwise, `false`.
 */
exports.custompattern = function (val, pattern) {
	if (util.isNullOrUndefined(pattern) || (!_.isString(pattern) && !_.isRegExp(pattern))) {
		throw new Error('pattern must be a valid regular expression string or a RegExp object');
	}

	try {
		return _.isString(val) && !_.isNull(val.match(pattern));
	} catch (e) {
		return false;
	}
};

/**
 * Determines whether `datetime` is formatted according to `format`.
 * @param {String} datetime The date/time.
 * @param {String} format The format.
 * @returns {Boolean} `true` if `datetime` matches `format`; otherwise, `false`.
 */
exports.datetime = function (datetime, format) {
	if (util.isNullOrUndefined(format) || !_.isString(format)) {
		throw new Error('format must be a string');
	}

	return moment(datetime, format, true).isValid();
};

/**
 * Determines whether `email` is valid.
 * @param {String} email The email.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.email = function (email) {
	return exports.custompattern(email, REGEX_EMAIL);
};

/**
 * Converts a validation errors object into a string.
 * @param {Object} errors Validation errors.
 * @returns {String} A string representation of `errors`.
 */
exports.errorsToString = function (errors) {
	if (errors && exports.plainobject(errors)) {
		return _.chain(errors).values().unique().value().sort().join('\n');
	} else {
		return null;
	}
};

/**
 * Determines whether `val` is or can be converted to a floating-point number.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to a floating-point number; otherwise, `false`.
 */
exports.float = function (val) {
	return (_.isNumber(val) || (_.isString(val) && REGEX_FLOAT.test(val))) && _.isFinite(parseFloat(val));
};

/**
 * Determines whether `heading` is a valid heading.
 * @param {Number} heading The heading.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.heading = function (heading) {
	return !util.isNullOrUndefined(heading) && 0 <= parseInt(heading, 10) && parseInt(heading, 10) <= 360;
};

/**
 * Determines whether `val` is a valid hexadecimal RGB color.
 * @param {String} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.hexcolor = function (val) {
	return exports.custompattern(val, REGEX_HEXCOLOR);
};

/**
 * Determines whether `val` is a valid mongoDb ObjectId. (Taken from https://github.com/mongodb/js-bson/blob/master/lib/bson/objectid.js)
 * @param {String} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.objectId = function (val) {
	if (util.isNullOrUndefined(val)) {
		return false;
	} else if (typeof val === 'number') {
		return true;
	} else if (typeof val === 'string') {
		return val.length === 12 || (val.length === 24 && REGEX_OBJECTID.test(val));
	} else {
		return false;
	}
};

/**
 * Determines whether `val` is a valid db id.
 * @param {String|Number} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.dbIdentifier = function (val) {
	return exports.objectId(val) || exports.int(val);
};

/**
 * Determines whether `val` is a valid hostname.
 * @param {String} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.host = function (val) {
	// NOTE: cannot protect against values such as '333.333.33.333' being entered as hostname validation will allow it
	return exports.ip(val) || exports.custompattern(val, REGEX_HOST);
};

/**
 * Determines whether `val` is or can be converted to a 8-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to a 8-bit integer; otherwise, `false`.
 */
exports.int8 = function (val) {
	return exports.intinbitsrange(val, 8, true);
};

/**
 * Determines whether `val` is or can be converted to a 16-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to a 16-bit integer; otherwise, `false`.
 */
exports.int16 = function (val) {
	return exports.intinbitsrange(val, 16, true);
};

/**
 * Determines whether `val` is or can be converted to a 32-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to a 32-bit integer; otherwise, `false`.
 */
exports.int32 = function (val) {
	return exports.intinbitsrange(val, 32, true);
};

/**
 * Determines whether `val` is or can be converted to a 32-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to a 32-bit integer; otherwise, `false`.
 */
exports.int = exports.int32;

/**
 * Determines whether `val` is or can be converted to an N-bit integer, signed or unsigned, as defined by `bits`.
 * @param {Number|String} val The value.
 * @param {Number} bits The number of bits.
 * @param {Boolean} signed Indicates whether the range is for a signed integer.
 * @returns {Boolean} `true` if `val` is or can be converted to an N-bit integer; otherwise, `false`.
 */
exports.intinbitsrange = function (val, bits, signed) {
	if (util.isNullOrUndefined(bits) || !_.isNumber(bits) || bits < 0) {
		throw new Error('bits must be a positive number');
	}

	if (util.isNullOrUndefined(signed) || !_.isBoolean(signed)) {
		throw new Error('signed must be a boolean value');
	}

	var min = signed ? -Math.pow(2, bits - 1) : 0,
		max = (signed ? Math.pow(2, bits - 1) : Math.pow(2, bits)) - 1;

	return exports.intinrange(val, min, max);
};

/**
 * Determines whether `val` is or can be converted to an integer that is inclusively contained in the range defined by `min` and `max`.
 * @param {Number|String} val The value.
 * @param {Number} min The minimum.
 * @param {Number} max The maximum.
 * @returns {Boolean} `true` if `val` is or can be converted to a number that is inclusively contained in the range; otherwise, `false`.
 */
exports.intinrange = function (val, min, max) {
	if (util.isNullOrUndefined(min) || !_.isNumber(min)) {
		throw new Error('min must be a number');
	}

	if (util.isNullOrUndefined(max) || !_.isNumber(max)) {
		throw new Error('max must be a number');
	}

	if (min > max) {
		throw new Error('min must be less than max');
	}

	if ((_.isNumber(val) && val % 1 === 0) || (_.isString(val) && REGEX_INT.test(val))) {
		var int = parseInt(val, 10);

		if (_.isFinite(int)) {
			return int >= min && int <= max;
		}
	}

	return false;
};

/**
 * Determines whether `val` is a valid IP address.
 * @param {String} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.ip = function (val) {
	return exports.custompattern(val, REGEX_IP);
};

/**
 * Determines whether `val` is `undefined`, `null` or an empty representation of its type.
 * @param {*} val The value.
 * @returns {Boolean} `true` if `val` is `undefined`, `null` or empty; otherwise, `false`.
 */
exports.isNullOrEmpty = function (val) {
	return _.isUndefined(val) || _.isNull(val) || ((_.isString(val) || _.isArray(val) || _.isObject(val)) && _.isEmpty(val));
};

/**
 * Determines whether `isodate` is a valid ISO-formatted date.
 * @param {String} isodate The date.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.isodate = function (isodate) {
	return moment(isodate, 'YYYY-MM-DD', true).isValid();
};

/**
 * Determines whether `isotime` is a valid ISO-formatted time.
 * @param {String} isotime The time.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.isotime = function (isotime) {
	return moment(isotime, 'HH:mm:ss', true).isValid();
};

/**
 * Determines if `val` is valid JSON.
 * @param {*} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.json = function (val) {
	// http://stackoverflow.com/a/3710226/4552157
	try {
		JSON.parse(val);
	} catch (e) {
		return false;
	}

	return true;
};

/**
 * Determines whether `points` is or contains only valid latitude values.
 * @param {Number[]|Number} points The latitude value or values.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.lat = function (points) {
	if (!_.isArray(points)) {
		points = [points];
	}

	return _.all(points, function (point) {
		return (!util.isNullOrUndefined(point) && parseInt(point, 10) !== 0 && -90 < parseInt(point, 10) && parseInt(point, 10) < 90);
	});
};

/**
 * Determines whether `points` is or contains only valid longitude values.
 * @param {Number[]|Number} points The longitude value or values.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.lon = function (points) {
	if (!_.isArray(points)) {
		points = [points];
	}

	return _.all(points, function (point) {
		return (!util.isNullOrUndefined(point) && parseInt(point, 10) !== 0 && -180 < parseInt(point, 10) && parseInt(point, 10) < 180);
	});
};

/**
 * Determines whether `coords` is or contains only valid coordinate values.
 * @param {Object} coord The coordinate value or values.
 * @param {Number} coord.lat The latitude value.
 * @param {Number} coord.lon The longitude value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.coordinate = function (coord) {
	if (!coord || !coord.lat || !coord.lon) {
		return false;
	}

	var lat = parseInt(coord.lat, 10),
		lon = parseInt(coord.lon, 10);

	if (lat <= -90 || 90 <= lat) {
		return false;
	} else if (lon <= -180 || 180 <= lon) {
		return false;
	} else {
		return !(lat === 0 && lon === 0);
	}
};

/**
 * The validation function.
 * @callback validationFunction
 * @returns {?String} The text of the validation error; or, if there were no errors `null` or `undefined`.
 */

/**
 * Performs parameter validation using the supplied function.
 * @param {validationFunction} func The validation function.
 * @returns {Promise} A promise that will be rejected if an error is returned from `func`.
 */
exports.parameters = function (func) {
	return Promise.try(func).catch(function (err) {
		// If any errors were thrown in validation, encapsulate those.
		throw new SiteError('Unable to validate parameters', SiteError.Internal, err);
	}).then(function (err) {
		// Otherwise, if an error was returned, make a custom error out of it.
		if (err) {
			if (_.isString(err)) {
				// Strings were used directly to create an error.
				throw new SiteError(err, SiteError.InvalidArgument);
			} else if (exports.plainobject(err) && !_.isEmpty(err)) {
				// If an object is passed in and it's not empty, assume that it's a validation errors object.
				//  It should get stored in the SiteError in the data object.
				throw new SiteError(exports.errorsToString(err), SiteError.InvalidArgument, err);
			}
		}
	});
};

/**
 * Determines whether `password` is valid based on the supplied `requirements`.
 * @param {String} password The password.
 * @param {Object} requirements The password requirements.
 * @param {Number} requirements.characters The minimum password length.
 * @param {Number} requirements.lowercase The minimum number of lowercase letters.
 * @param {Number} requirements.uppercase The minimum number of uppercase letters.
 * @param {Number} requirements.numbers The minimum number of numbers.
 * @param {Number} requirements.special The minimum number of special characters.
 *                                      The following qualify as special characters: `~!@#$%^&*()_-=+\|{}[]'";:<.>/?,
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.password = function (password, requirements) {
	return exports.passwordRules(password, requirements).isValid;
};

/**
 * Evaluates the supplied password against the standard complexity criteria.
 * @param {String} password The password.
 * @returns {Object} An object describing the result of the complexity evaluation.
 */
exports.evaluatePasswordComplexity = function (password) {
	if (util.isNullOrUndefined(password) || !_.isString(password)) {
		password = '';
	}

	var evaluations = {};

	_.each(PASSWORD_COMPLEXITY_PARAMETERS, function (parameter, name) {
		var evaluation = evaluations[name] = {
			description: parameter.description
		};

		if (_.isRegExp(parameter.evaluate)) {
			var matches = password.match(parameter.evaluate) || [];

			evaluation.count = matches.length;
		} else if (_.isFunction(parameter.evaluate)) {
			evaluation.count = parameter.evaluate(password);
		}
	});

	return evaluations;
};

/**
 * Determines whether `password` is valid based on the supplied `requirements`.
 * @param {String|Object} evaluations The password; or, an evaluation result object from {@link evaluatePasswordComplexity}.
 * @param {Object} requirements The password requirements.
 * @param {Number} requirements.characters The minimum password length.
 * @param {Number} requirements.lowercase The minimum number of lowercase letters.
 * @param {Number} requirements.uppercase The minimum number of uppercase letters.
 * @param {Number} requirements.numbers The minimum number of numbers.
 * @param {Number} requirements.special The minimum number of special characters.
 *                                      The following qualify as special characters: `~!@#$%^&*()_-=+\|{}[]'";:<.>/?,
 * @returns {Object} An object describing the password rules validation result.
 */
exports.passwordRules = function (evaluations, requirements) {
	if (!evaluations) {
		// If evaluations weren't passed in, generate them.
		evaluations = exports.evaluatePasswordComplexity(evaluations);
	}

	var results = {};

	_.each(evaluations, function (evaluation, name) {
		var result = results[name] = {},
			requiredCount = requirements[name] || 0;

		result.requiredCount = requiredCount;
		result.count = evaluation.count;
		result.valid = evaluation.count >= requiredCount;
		result.message = util.format('Requires at least %s %s.', requiredCount, evaluation.description);
	});

	// Generate the `isValid` property that can be used to determine overall validity.
	results.isValid = _.all(results, function (result) {
		return result.valid;
	});

	return results;
};

/**
 * Determines whether `val` is a plain object, likely defined with an object literal.
 * @param {*} val The value.
 * @returns {Boolean} `true` if `val` is a plain object; otherwise, `false`.
 */
exports.plainobject = function (val) {
	return typeof val === 'object' && val.constructor === Object;
};

/**
 * Determines whether `val` is a valid port number.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.port = function (val) {
	return exports.uint16(val);
};

/**
 * @deprecated Use Underscore `isString` instead.
 */
exports.string = function (string) {
	return exports.custompattern(string, /[a-zA-Z0-9\s\-_\(\)\[\],\.\?@'"]*/);
};

/**
 * Determines whether `timestamp` is a valid UNIX timestamp.
 * @param {Number} timestamp The timestamp.
 * @param {Boolean} [inMilli] Indicates whether the timestamp is in milliseconds.
 * @returns {Boolean} `true` if valid; otherwise, `false`.
 */
exports.timestamp = function (timestamp, inMilli) {
	return exports.float(timestamp) && (!inMilli ? moment.unix(parseInt(timestamp, 10)).isValid() : moment(parseInt(timestamp, 10)).isValid());
};

/**
 * Determines whether `val` is or can be converted to an unsigned, 8-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to an unsigned, 8-bit integer; otherwise, `false`.
 */
exports.uint8 = function (val) {
	return exports.intinbitsrange(val, 8, false);
};

/**
 * Determines whether `val` is or can be converted to an unsigned, 16-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to an unsigned, 16-bit integer; otherwise, `false`.
 */
exports.uint16 = function (val) {
	return exports.intinbitsrange(val, 16, false);
};

/**
 * Determines whether `val` is or can be converted to an unsigned, 32-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to an unsigned, 32-bit integer; otherwise, `false`.
 */
exports.uint32 = function (val) {
	return exports.intinbitsrange(val, 32, false);
};

/**
 * Determines whether `val` is or can be converted to an unsigned, 32-bit integer.
 * @param {Number|String} val The value.
 * @returns {Boolean} `true` if `val` is or can be converted to an unsigned, 32-bit integer; otherwise, `false`.
 */
exports.uint = exports.uint32;

/**
 * Validates an optional field
 * @param {*} field The field value to validate
 * @param {Function} validateType The validation function to check against
 * @returns {Boolean} `true`, if the value is not provided or is valid; otherwise, `false`.
 */
exports.validateOptionalField = function (field, validateType) {
	var valid;

	if (typeof validateType !== 'function') {
		throw new TypeError('validateType must be a function.');
	} else {
		valid = util.isNullOrUndefined(field) || validateType(field);

		if (!_.isBoolean(valid)) {
			throw new TypeError('Invalid return type for validation function.');
		} else {
			return valid;
		}
	}
};
