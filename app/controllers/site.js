'use strict';

var activity = require(path.join(global.__modelsdir, 'activity')),
	responseHelper = require(path.join(global.__libdir, 'response-helper')),
	zillow = require(path.join(global.__modelsdir, 'zillow'));
/**
 * Renders the index page.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 */
exports.index = function (req, res) {
	res.render('index.ejs', {page: req.params.page});
};

/**
 * Renders the data.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.getData = function (req, res, next) {
	zillow.get({
		state: req.query.state,
		type: req.query.type
	}).then(function (data) {
		res.json(responseHelper.ok('Successfully retrieved data.', data));
	}).catch(next);
};

/**
 * Renders the address data.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.getAddressData = function (req, res, next) {
	activity.getAll().then(function (data) {
		var activities = data;

		return Promise.map(data.data, function (activity) {
			return zillow.getByAddress({
				address: encodeURIComponent(activity.address).replace(/\%20/g, '+'),
				zipcode: encodeURIComponent(activity.zipcode).replace(/\%20/g, '+')
			});
		}).then(function (data) {
			res.json(responseHelper.ok('Successfully retrieved data.', {
				data: data,
				filteredTotal: activities.filteredTotal,
				total: activities.total
			}));
		});
	}).catch(next);
};
