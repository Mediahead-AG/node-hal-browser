var http			= require('http'),
	express			= require('express'),
	app				= express(),
	reqLogger		= require('express-request-logger'),
	winston			= require('winston'),
	_				= require('lodash'),
	exphbs			= require('express-handlebars');

// Register some Globals
logger = new (winston.Logger)({
	transports: [ new (winston.transports.Console)() ]
});

// Handlebars
app.engine('handlebars', exphbs({}));
app.set('view engine', 'handlebars');

// Overwrite console.log
_.extend(console, logger);

// Set Environement
app.set('port', (process.env.PORT || 5000));

// Logging
app.use(reqLogger.create({
	'log': function(level, message, params) {
		if(!message) {
			message = params.method + ' ' +
				params.url + ' ' +
				params.status + ' ' +
				params.response_time + 'ms';
		}
		logger.log(level, message, params);
	}
}));

var apis = (process.env.APIS || '/').split(',');
for(var i = 0; i < apis.length; i++) {
	apis[i] = {
		'url': apis[i].split('=')[1],
		'name': apis[i].split('=')[0]
	};
}

// Register Satic File Serving
app.use(express.static(__dirname + '/hal-browser/'));
app.get('/', function(req, res, next) {
	res.render('index', {
		apis : apis
	});
});

http.createServer(app).listen(app.get('port'), function() {
	console.info("Node app is running at localhost:" + app.get('port'));
});