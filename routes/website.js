var express = require('express');
// var RoomController = require(__rootPath+"/controllers/roomController");
module.exports = function(app) {
	
	app.get('/', function(req, res) {
		res.sendFile(__rootPath + '/static/htmls/app.html');
		//response.render(template, data);
	});
	app.get('/apptest', function (req, res) {
    	res.end(req.query.callback+'('+JSON.stringify({'success':true})+')');
	});
};
