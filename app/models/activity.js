'use strict';

var moment = require('moment');

exports.getActivity = function (obj) {
	return Promise.resolve({
		_id: 1,
		date: moment.now(),
		bidAmount: 1000,
		paidAmount: 1000,
		address: '1835 Bay St SE',
		address1: null,
		city: 'Washington',
		state: 'DC',
		zipcode: '20003',
		notes: '',
		created: moment.now()
	});
};

exports.getAllActivities = function (obj) {
	return Promise.resolve({
		data: [{
			_id: 1,
			date: moment.now(),
			bidAmount: 1000,
			paidAmount: 1000,
			address: '1835 Bay St SE',
			address1: null,
			city: 'Washington',
			state: 'DC',
			zipcode: '20003',
			notes: '',
			created: moment.now()
		}, {
			_id: 2,
			date: moment.now(),
			bidAmount: 12000,
			paidAmount: 11000,
			address: '606 15th St NE',
			address1: null,
			city: 'Washington',
			state: 'DC',
			zipcode: '20002',
			notes: '',
			created: moment.now()
		}],
		filteredTotal: 2,
		total: 2
	});
};

exports.addActivity = function (obj) {
	return Promise.resolve({});
};

exports.deleteActivity = function (obj) {
	return Promise.resolve();
};