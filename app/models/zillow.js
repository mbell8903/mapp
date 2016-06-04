'use strict';

var parseString = Promise.promisify(require('xml2js').parseString),
	rp = require('request-promise');

/**
 *
 * @param {String} obj.state The state.
 * @param {String} obj.type The type.
 * @returns {Promise<T>}
 */
exports.get = function (obj) {
	return rp({
		url: 'http://www.zillow.com/webservice/GetRegionChildren.htm',
		qs: {
			'zws-id': 'X1-ZWz19pfi8vvmyz_7zykg',
			state: obj.state,
			childtype: obj.type
		}
	}).then(function (data) {
		return parseString(data).then(function (data) {
			return data['RegionChildren:regionchildren'].response || {};
		});
	});
};

/**
 *
 * @param {String} obj.address The address.
 * @param {String} obj.zipcode The zip.
 * @returns {Promise<T>}
 */
exports.getByAddress = function (obj) {
	return rp({
		url: 'http://www.zillow.com/webservice/GetSearchResults.htm',
		qs: {
			'zws-id': 'X1-ZWz19pfi8vvmyz_7zykg',
			address: obj.address,
			citystatezip: obj.zipcode
		}
	}).then(function (data) {
		return parseString(data).then(function (data) {
			if (data['SearchResults:searchresults'].response && data['SearchResults:searchresults'].response[0] && data['SearchResults:searchresults'].response[0].results && data['SearchResults:searchresults'].response[0].results[0] && data['SearchResults:searchresults'].response[0].results[0].result && data['SearchResults:searchresults'].response[0].results[0].result[0]) {
				return data['SearchResults:searchresults'].response[0].results[0].result[0];
			}

			return {};
		});
	}).then(function (data) {
		return _.omit(data, 'links');
	});
};