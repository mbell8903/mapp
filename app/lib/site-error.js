/*
 * 
 */

'use strict';

var util = require('util');

var INDENT_CHARS = '    ',
// Start with a forward mapping from error name to error type.
// Any resemblance to HTTP status codes is purely coincidental.
	namesToTypes = {
		/**
		 * Payment Required
		 * @name SiteError.PaymentRequired
		 * @type {Number}
		 */
		PaymentRequired: 402,
		/**
		 * Not Authorized
		 * @name SiteError.NotAuthorized
		 * @type {Number}
		 */
		NotAuthorized: 403,
		/**
		 * Not Found
		 * @name SiteError.NotFound
		 * @type {Number}
		 */
		NotFound: 404,
		/**
		 * Timeout
		 * @name SiteError.Timeout
		 * @type {Number}
		 */
		Timeout: 408,
		/**
		 * Invalid Argument
		 * @name SiteError.InvalidArgument
		 * @type {Number}
		 */
		InvalidArgument: 409,
		/**
		 * Content Length
		 * @name SiteError.ContentLength
		 * @type {Number}
		 */
		ContentLength: 411,
		/**
		 * Entity Too Large
		 * @name SiteError.EntityTooLarge
		 * @type {Number}
		 */
		EntityTooLarge: 413,
		/**
		 * Dependency Failed
		 * @name SiteError.DependencyFailed
		 * @type {Number}
		 */
		DependencyFailed: 424,
		/**
		 * Missing Parameter
		 * @name SiteError.MissingParameter
		 * @type {Number}
		 */
		MissingParameter: 444,
		/**
		 * Internal
		 * @name SiteError.Internal
		 * @type {Number}
		 */
		Internal: 500
	},
// Produce a reverse map for use in the toString function.
	typesToNames = _.invert(namesToTypes);

/**
 * Creates a new exception.
 * @param {String} msg The message.
 * @param {Number} [type] The type.
 * @param {Object} [data] Additional structured data about the error.
 * @param {Error} [innerError] The error that is the cause of this error.
 * @class
 */
function SiteError(msg, type, data, innerError) {
	if (!(this instanceof SiteError)) {
		// Guard against calls without the new operator.
		return new SiteError(msg, type, innerError);
	}

	if (type instanceof Error) {
		// no type, no data
		innerError = type;
		type = data = undefined;
	} else if (_.isNumber(type) && data instanceof Error) {
		// type, but no data
		innerError = data;
		data = undefined;
	}

	Error.call(this);
	Error.captureStackTrace(this, SiteError);

	// Both of these have to be manually set. Calling Error.call(this, msg) does not work
	//  to assign the message property using the base constructor.
	this.name = SiteError.name;
	this.message = msg;

	var _type = type || SiteError.Internal,
		_data = data,
		_innerError,
		_stack = this.stack;

	if (innerError && innerError instanceof Error) {
		_innerError = innerError;
	} else {
		// Use null to specifically indicate no inner error.
		_innerError = null;
	}

	// The `type` and `innerError` properties are specific to this instance and
	//  need to be created every time a new instance is created. They need to work
	//  off of these locally defined private variables to ensure that they are
	//  protected from any external changes.
	Object.defineProperties(this, {
		/**
		 * The type of the exception.
		 * @name SiteError#type
		 * @type Number
		 */
		type: {
			get: function () {
				return _type;
			}
		},
		/**
		 * Additional structured data about the error.
		 * @name SiteError#data
		 * @type Object
		 */
		data: {
			get: function () {
				return _data;
			}
		},
		/**
		 * The error that is the cause of this error.
		 * @name SiteError#innerError
		 * @type Error
		 */
		innerError: {
			get: function () {
				return _innerError;
			}
		},
		/**
		 * The stack trace.
		 * @name SiteError#stack
		 * @type String
		 */
		stack: {
			get: function () {
				return this.toString() + '\n' + _stack.split('\n').slice(1).join('\n');
			}
		}
	});
}

util.inherits(SiteError, Error);

/**
 * Returns a string representation of the error.
 * @returns {String} A string representation of the error.
 */
SiteError.prototype.toString = function toString() {
	return util.format('%s[%s]: %s', this.name, typesToNames[this.type], this.message);
};

// Add the fullStack property to the prototype.
Object.defineProperties(SiteError.prototype, {
	/**
	 * The full stack, including inner errors.
	 * @name SiteError#fullStack
	 * @type String
	 */
	fullStack: {
		get: function () {
			var err = this,
				fullStack = [],
				indent = '';

			do {
				// Apply the indent to the current stack.
				var stackLines = err.stack.split('\n');

				for (var i = 0; i < stackLines.length; i++) {
					stackLines[i] = indent + stackLines[i];
				}

				fullStack.push(stackLines.join('\n'));

				// Increase the indent and move to the next error.
				indent += INDENT_CHARS;
				err = err.innerError;
			} while (err);

			return fullStack.join('\n\n');
		}
	}
});

// Set up the property definitions for the types from the forward map.
var propertyDefinitions = _.mapObject(namesToTypes, function (value) {
	return {
		value: value
	};
});

// Create the "static" type properties on the SiteError class.
Object.defineProperties(SiteError, propertyDefinitions);

// Prevent addition of static properties on SiteError.
Object.seal(SiteError);
// Prevent addition of properties on the prototype.
Object.seal(SiteError.prototype);

module.exports = SiteError;
