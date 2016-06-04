/*
 * 
 */

'use strict';

var moment = require('moment'),
	util = require('util'),
	responseHelper = require(path.join(global.__libdir, 'response-helper'));

/**
 * Logs information about the completion of a response.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.addResponseLogger = function (req, res, next) {
	res.on('finish', function () {
		let latency = (req.clienttime ? 'Client Latency: ' + (req.time.valueOf() - req.clienttime.valueOf()) + 'ms -> ' : '') + 'Response Latency: ' + (moment().valueOf() - req.time.valueOf()) + 'ms',
			message = 'Route' + ': [' + res.statusCode + '] ' + (req.route ? _.keys(req.route.methods)[0].toUpperCase() + ' ' + req.route.path : 'Unknown') + ' -> ' + latency;

		if ([301, 302].indexOf(res.statusCode) !== -1) {
			message += ' => ' + res.getHeader('Location');
		}

		console.info(message);
	});

	return next();
};

/**
 * Logs the request.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.logRequest = function (req, res, next) {
	let lines = [];

	lines.push('Url: ' + req.method + ' ' + req.url);
	lines.push('IP: ' + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));

	if (req.headers && !_.isEmpty(req.headers)) {
		lines.push(util.format('Headers: %s', JSON.stringify(req.headers, null, 4)));
	}

	if (req.body && !_.isEmpty(req.body)) {
		let body = req.body;

		if (body.password) {
			// Try to make sure we don't log people's passwords.
			body = _.clone(body);

			body.password = '********';
		}

		lines.push(util.format('Body: %s', JSON.stringify(body, null, 4)));
	}

	if (req.authorization && !_.isEmpty(_.object(req.authorization))) {
		lines.push(util.format('Auth: %j', req.authorization));
	}

	if (req.headers.date) {
		req.clienttime = moment(new Date(req.headers.date));
	}

	console.info(lines.join('\n'));
	return next();
};

/**
 * Handle page not found.
 * @param {Object} req The request
 * @param {Object} res The response
 */
exports.handleNotFound = function (req, res) { // Assume 404 since no middleware responded
	return res.status(404).render('404');
};

/**
 * Handles errors
 * @param {Object} err The error
 * @param {Object} req The request
 * @param {Object} res The response
 */
exports.handleTLError = function (err, req, res) {
	if (err.type === SiteError.Internal) {
		SiteUtil.logError(err);
	} else {
		SiteUtil.logError(err, console.debug);
	}

	if (req.accepts('html')) {
		return _handleTLErrorHTML(err, req, res);
	} else if (req.accepts('json')) {
		return _handleTLErrorJSON(err, req, res);
	} else if (req.accepts('text')) {
		return _handleTLErrorText(err, req, res);
	} else {
		return res.end();
	}
};

/**
 * Handles errors
 * @param {Object} err The error
 * @param {Object} req The request
 * @param {Object} res The response
 */
function _handleTLErrorJSON(err, req, res) {
	var obj = responseHelper.error('UnknownError', err.message);

	switch (err.type) {
		case SiteError.PaymentRequired:
			res.status(402);
			obj.code = 'PaymentRequiredError';
			break;
		case SiteError.NotAuthorized:
			res.status(403);
			obj.code = 'NotAuthorizedError';
			break;
		case SiteError.NotFound:
			res.status(404);
			obj.code = 'NotFoundError';
			break;
		case SiteError.Timeout:
			res.status(408);
			obj.code = 'TimeoutError';
			break;
		case SiteError.InvalidArgument:
			res.status(409);
			obj.code = 'InvalidArgumentError';
			break;
		case SiteError.ContentLength:
			res.status(411);
			obj.code = 'ContentLengthError';
			break;
		case SiteError.DependencyFailed:
			res.status(424);
			obj.code = 'DependencyFailedError';
			break;
		case SiteError.MissingParameter:
			res.status(444);
			obj.code = 'MissingParameterError';
			break;
		case SiteError.Internal:
			res.status(500);
			obj.code = 'InternalError';
			break;
		default:
			res.status(500);
			break;
	}

	return res.json(obj);
}

/**
 * Handles errors
 * @param {Object} err The error
 * @param {Object} req The request
 * @param {Object} res The response
 */
function _handleTLErrorHTML(err, req, res) {
	var obj = responseHelper.error('UnknownError', err.message);

	switch (err.type) {
		case SiteError.PaymentRequired:
			res.status(402);
			obj.code = http.STATUS_CODES[402];
			break;
		case SiteError.NotAuthorized:
			return res.status(403).render('403');
		case SiteError.NotFound:
			return exports.handleNotFound(req, res);
		case SiteError.Timeout:
			res.status(408);
			obj.code = http.STATUS_CODES[408];
			break;
		case SiteError.InvalidArgument:
			res.status(409);
			obj.code = http.STATUS_CODES[409];
			break;
		case SiteError.ContentLength:
			res.status(411);
			obj.code = http.STATUS_CODES[411];
			break;
		case SiteError.DependencyFailed:
			res.status(424);
			obj.code = http.STATUS_CODES[424];
			break;
		case SiteError.MissingParameter:
			res.status(444);
			obj.code = http.STATUS_CODES[444];
			break;
		//case 500:
		default:
			return res.status(500).render('500', {
				message: obj.message,
				showerr: global.config.ENV === 'development',
				err: err
			});
	}

	return res.render('error', {
		code: err.type,
		title: obj.code,
		message: obj.message,
		showerr: global.config.ENV === 'development',
		err: err
	});
}

/**
 * Handles errors
 * @param {Object} err The error
 * @param {Object} req The request
 * @param {Object} res The response
 */
function _handleTLErrorText(err, req, res) {
	var obj = responseHelper.error('UnknownError', err.message);

	switch (err.type) {
		case SiteError.PaymentRequired:
			res.status(402);
			obj.code = 'PaymentRequiredError';
			break;
		case SiteError.NotAuthorized:
			res.status(403);
			obj.code = 'NotAuthorizedError';
			break;
		case SiteError.NotFound:
			res.status(404);
			obj.code = 'NotFoundError';
			break;
		case SiteError.Timeout:
			res.status(408);
			obj.code = 'TimeoutError';
			break;
		case SiteError.InvalidArgument:
			res.status(409);
			obj.code = 'InvalidArgumentError';
			break;
		case SiteError.ContentLength:
			res.status(411);
			obj.code = 'ContentLengthError';
			break;
		case SiteError.DependencyFailed:
			res.status(424);
			obj.code = 'DependencyFailedError';
			break;
		case SiteError.MissingParameter:
			res.status(444);
			obj.code = 'MissingParameterError';
			break;
		case SiteError.Internal:
			res.status(500);
			obj.code = 'InternalError';
			break;
		default:
			res.status(500);
			break;
	}

	return res.send(obj.code + '\n' + obj.message + (obj.securityclassification ? '\n' + obj.securityclassification : ''));
}

