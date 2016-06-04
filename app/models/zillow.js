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
			address: encodeURIComponent(obj.address).replace(/\%20/g, '+'),
			citystatezip: encodeURIComponent(obj.zipcode).replace(/\%20/g, '+')
		}
	}).then(function (data) {
		return parseString(data).then(function (data) {
			if (data['SearchResults:searchresults'].response && data['SearchResults:searchresults'].response[0] && data['SearchResults:searchresults'].response[0].results && data['SearchResults:searchresults'].response[0].results[0] && data['SearchResults:searchresults'].response[0].results[0].result && data['SearchResults:searchresults'].response[0].results[0].result[0]) {
				var x = data['SearchResults:searchresults'].response[0].results[0].result[0];

				return {
					type: 'Feature',
					properties: {
						name: x.address[0].street[0],
						popupContent: '$' + x.zestimate[0].amount[0]['_']
					},
					geometry: {
						type: 'Point',
						coordinates: [x.address[0].longitude[0], x.address[0].latitude[0]]
					}
				};
			}

			return {};
		});
	}).then(function (data) {
		return _.omit(data, 'links');
	});
};