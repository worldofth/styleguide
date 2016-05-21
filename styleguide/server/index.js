'use strict';

var express = require('express'),
	app = express(),
	compression = require('compression'),
	exphbs  = require('express-handlebars'),
	path = require('path'),
	ASQ = require('asynquence'),
	_ = require('lodash'),
	util = require('./util');

var rootDir = path.resolve(__dirname, '..'),
	clientDir = path.resolve(rootDir, 'client');

var defaults = {
	ext: '.html',
	components: path.resolve(process.cwd(), 'components'),
	data: path.resolve(process.cwd(), 'data'),
	staticLocalDir: path.resolve(process.cwd(), 'resources'),
	staticPath: '/resources',
	stylesheets: ['main.css'],
    scripts: ['main.js'],
    helpers: {}
};

function start(options){
	options = _.assign(options, defaults);

	var hps = exphbs.create({
		defaultLayout: 'main',
		layoutsDir: clientDir,
		extname: options.ext,
		partialsDir: options.components,
		helpers: options.helpers
	});

	var staticConfig = {
        stylesheets: util.normalizeAssetPaths(options.staticPath, options.stylesheets),
        scripts: util.normalizeAssetPaths(options.staticPath, options.scripts)
    };

    app.engine(options.ext, hps.engine);
    app.set('views', options.components);
    app.set('view engine', options.ext);
    app.use(compression());
    app.use('/client', express.static(clientDir));
    app.use(options.staticPath, express.static(options.staticLocalDir));

    ASQ()
	.all(
		function(done){
			hps.getPartials().then(done).catch(done.fail);
		},
		function(done){
			hps.getTemplates(options.components).then(done).catch(done.fail);
		}
	).val(function(partials, templates){

		var data = util.getTemplateData(options.data+'/**/*.json');
		var testTemplate = templates['testpartial.html'](_.assign(data, {}), {partials: partials});

		app.get('/', function (req, res) {
		    res.render(path.resolve(options.components, 'home'));
		});

		app.get('/test', function (req, res) {
		    res.render(path.resolve(clientDir, 'test'), _.assign(data, {data: testTemplate}));
		});

	})
	.or(function(err){
		console.log(err);
	});

	app.set('port', (process.env.PORT || 3000));

	var server = app.listen(app.get('port'), function() {
        var host = server.address().address,
            port = server.address().port;
        console.log('Styleguide server started at http://%s:%s', host, port);
    });

    return {
        app: app,
        server: server,
        hps: hps
    };
}

module.exports = start;