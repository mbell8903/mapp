'use strict';

exports.get = function (obj) {
	return Promise.resolve({
		address: '1835 Bay St SE',
		zipcode: '20003'
	});
};

exports.getAll = function (obj) {
	return Promise.resolve({
		data: [{
			address: '1835 Bay St SE',
			zipcode: '20003'
		}, {
			address: '606 15th St NE',
			zipcode: '20002'
		}],
		filteredTotal: 2,
		total: 2
	});
};