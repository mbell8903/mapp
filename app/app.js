'use strict';

global.Promise = require('bluebird');
global._ = require('underscore');
global.path = require('path');

var bodyParser = require('body-parser'),
	compression = require('compression'),
	consolidate = require('consolidate'),
	express = require('express'),
	methodOverride = require('method-override'),
	fs = require('fs'),
	http = require('http'),
	moment = require('moment'),
	readDir = Promise.promisify(fs.readdir);

process.on('uncaughtException', function (err) {
	console.error('uncaughtException: ', err.message);
	console.error(err.stack);
	process.exit(1);
});

// Set up the various directory constants.
global.__basedir = path.join(__dirname, '..');
global.__appdir = __dirname;
global.__assetsdir = path.join(global.__basedir, 'public');
global.__configdir = path.join(global.__appdir, 'config');
global.__routesdir = path.join(global.__appdir, 'routes');
global.__modelsdir = path.join(global.__appdir, 'models');
global.__ctrldir = path.join(global.__appdir, 'controllers');
global.__viewsdir = path.join(global.__appdir, 'views');
global.__libdir = path.join(global.__appdir, 'lib');

// Sets the SiteUtil global
global.SiteUtil = require(path.join(global.__libdir, 'site-util'));

// Set the SiteError global
global.SiteError = require(path.join(global.__libdir, 'site-error'));

Promise.config({
	// Turn off Bluebird's promise warnings to clean up the logs.
	// These should be turned back on periodically to check our code; but, they
	//  warn about library code issues as well which we can't do anything about.
	warnings: false
});

// Load the configuration after the directory constants.
global.config = require('./config/config').get();

// Set up logging
require(path.join(global.__libdir, 'site-logging')).set({
	title: global.config.TITLE,
	level: global.config.LOG_LEVEL || 'info',
	facility: 'local4'
});

if (Promise.config) {
	Promise.config({
		// Turn off Bluebird's promise warnings to clean up the logs.
		// These should be turned back on periodically to check our code; but, they
		//  warn about library code issues as well which we can't do anything about.
		warnings: false
	});
}

// Express configuration
var app = express();

var middleware = require(path.join(global.__libdir, 'middleware'));

// Should be placed before express.static to ensure that all assets and data are compressed (utilize bandwidth)
app.use(compression({
	level: 9 // Levels are specified in a range of 0 to 9, where-as 0 is no compression and 9 is best compression, but slowest
}));

// Globally include these libraries for rendering
app.locals._ = _; // use underscore in views
app.locals.moment = moment; // use moment in views

app.enable('trust proxy');

// assign the template engine to .ejs files
app.engine('ejs', consolidate.ejs);

// set .ejs as the default extension
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', global.__viewsdir);

//static resources for stylesheets, images, javascript files
// app.use('/public', express.static(global.__assetsdir));
app.use(express.static(global.__assetsdir));

// Extend the request with some basic elements
app.use(function (req, res, next) {
	req.time = moment();
	return next();
});

app.use(bodyParser.json({
	limit: '50mb'
}));

app.use(bodyParser.urlencoded({
	extended: true,
	limit: '50mb'
}));

// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(methodOverride());

// Add handle for response logging.
app.use(middleware.addResponseLogger);

// Log the incoming request.
app.use(middleware.logRequest);

readDir(global.__routesdir).then(function (routes) {
	// load each resource
	routes.sort();

	routes.forEach(function (route) {
		if (path.extname(route) === '.js') {
			route = route.slice(0, route.length - 3); // Remove extension
			require(path.join(global.__routesdir, route))(app); // Include the route file
		} else {
			console.warn('Skipped loading route: ' + route + ' because it is not a route file');
		}
	});

	// DO NOT REMOVE the `next` parameter
	app.use(function (err, req, res, next) {
		if (err.message && _.isObject(err.message)) {
			err = err.message;
		}

		if (!(err instanceof SiteError)) {
			var inner;

			if (err instanceof Error) {
				inner = err;
			}

			err = new SiteError('An unknown error occurred.', SiteError.Internal, inner);
		}

		middleware.handleTLError(err, req, res);
	});

	app.set('port', process.env.PORT || global.config.PORT);

	// Create our HTTP server.
	http.createServer(app).listen(app.get('port'), function () {
		app._router.stack.forEach(function (r) {
			if (r.route) {
				_.each(_.keys(r.route.methods), function (method) {
					console.info(method.toUpperCase() + ' ' + r.route.path);
				});
			}
		});

		console.info('Server started on port 0.0.0.0:' + app.get('port'));
		console.info('---------------------------------------------------');
	});
});
