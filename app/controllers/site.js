'use strict';

var responseHelper = require(path.join(global.__libdir, 'response-helper'));
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
 */
exports.getData = function (req, res) {
	var data = require(path.join(global.__modelsdir, 'data.json'));
	res.json(responseHelper.ok('Successfully retrieved data.', data));
};

/**
 * Renders the product families.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 */
exports.getProductFamilies = function (req, res) {
	var data = require(path.join(global.__modelsdir, 'productFamilies.json'));
	res.json(responseHelper.ok('Successfully retrieved product families.', data));
};
