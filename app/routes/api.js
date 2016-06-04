'use strict';

var apiCtrl = require(path.join(global.__ctrldir, 'api'));

/**
 * The site routes
 * @param {Object} app An ExpressJS object
 */
module.exports = function (app) {
	app.route('/api/data')
		.get(apiCtrl.getData);

	app.route('/api/addresses')
		.get(apiCtrl.getAddressData);

	app.route('/api/activities')
		.get(apiCtrl.getAllActivities)
		.post(apiCtrl.addActivity);

	app.route('/api/activities/:id')
		.get(apiCtrl.getActivity)
		.delete(apiCtrl.deleteActivity);
};
