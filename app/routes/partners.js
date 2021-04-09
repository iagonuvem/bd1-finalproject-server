var request = require('request');

module.exports = function(application){
    var mod = '/partners/';

    application.get(mod+'getAll', function(req, res){
        application.app.controllers.partner.getAll(application,req,res);
    })
}