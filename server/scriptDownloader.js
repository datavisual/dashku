'use strict';



// Dependencies
//
var fs                    = require('fs');
var ss                    = require('socketstream');
var Dashboard             = ss.api.app.models.Dashboard;
var apiUrl                = ss.api.app.config.apiUrl;



var rubyScript      = fs.readFileSync(__dirname + '/scriptDownloads/script.rb');
var nodejsScript    = fs.readFileSync(__dirname + '/scriptDownloads/script.js');
var coffeeScript    = fs.readFileSync(__dirname + '/scriptDownloads/script.coffee');
var phpScript       = fs.readFileSync(__dirname + '/scriptDownloads/script.php');
var pythonScript    = fs.readFileSync(__dirname + '/scriptDownloads/script.py');



var attributes = {

	rb: {
		script       : rubyScript,
		contentType  : 'ruby'
	},

	js: {
		script       : nodejsScript,
		contentType  : 'javascript'
	},

	coffee: {
		script       : coffeeScript,
		contentType  : 'coffeescript'
	},

	php: {
		script       : phpScript,
		contentType  : 'php'
	},

	py: {
		script       : pythonScript,
		contentType  : 'python'
	}
};



var wrapperFunction = function (req,res, fileFormat) {
	Dashboard.findOne({_id: req.params.dashboardId}, function (err, dashboard) {
		if (err === null && dashboard) {
			var widget  = dashboard.widgets.id(req.params.id);
			var data    = attributes[fileFormat].script.replace(/URL/,apiUrl).replace(/JSONDATA/,widget.json).replace(/WIDGETID/,widget._id);
			res.writeHead(200, { 'Content-disposition': 'attachment', 'Content-Type': 'application/' + attributes[fileFormat].contentType });
			res.end(data);
		} else {
			res.writeHead(402, { 'Content-Type': 'text/plain' });
			res.end(err);
		}
	});
};



module.exports = function (req,res) {

	var parsedFormat = req.params.format.split('.');
	var fileFormat   = parsedFormat[parsedFormat.length-1];

	if (attributes[fileFormat] === undefined) {
		res.writeHead(402, { 'Content-Type': 'text/plain' });
		res.end('not identified');
	} else {
		wrapperFunction(req, res, fileFormat);
	}

};