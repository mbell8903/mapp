'use strict';

/**
 * Renders the index page.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 */
exports.index = function (req, res) {
	res.render('index.ejs', {page: req.params.page});
};