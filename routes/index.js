var express = require('express');
var router = express.Router();

var fs = require('fs');

router.get('/lang/:locale', function(req,res){
	fs.readFile('./locales/site/' + req.param('locale') + ".js", "utf8",function(err, file){
		try {
			var localeJson = JSON.parse(file);
			return res.json(localeJson);
		} catch(e) {
			return res.json({});
		}
	});
});

module.exports = router;
