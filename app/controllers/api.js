'use strict';

var activity = require(path.join(global.__modelsdir, 'activity')),
	responseHelper = require(path.join(global.__libdir, 'response-helper')),
	zillow = require(path.join(global.__modelsdir, 'zillow'));

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
	activity.getAllActivities().then(function (data) {
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

/**
 * Gets an activity.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.getActivity = function (req, res, next) {
	activity.getActivity({
		_id: req.params.id
	}).then(function (data) {
		res.json(responseHelper.ok('Successfully retrieved activity.', data));
	}).catch(next);
};

/**
 * Gets all activities.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.getAllActivities = function (req, res, next) {
	activity.getAllActivities({

	}).then(function (data) {
		res.json(responseHelper.ok('Successfully retrieved activities.', data));
	}).catch(next);
};

/**
 * Adds and activity.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.addActivity = function (req, res, next) {
	activity.addActivity({
		date: req.body.date,
		bidAmount: req.body.bidAmount,
		paidAmount: req.body.paidAmount,
		address: req.body.address,
		address1: req.body.address1,
		city: req.body.city,
		state: req.body.state,
		zipcode: req.body.zipcode,
		notes: req.body.notes
	}).then(function (data) {
		res.json(responseHelper.ok('Successfully added activity.', data));
	}).catch(next);
};

/**
 * Deletes activities.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @param {Function} next The next middleware to execute.
 */
exports.deleteActivity = function (req, res, next) {
	activity.deleteActivity({
		_id: req.params.id
	}).then(function () {
		res.json(responseHelper.ok('Successfully deleted activity.'));
	}).catch(next);
};