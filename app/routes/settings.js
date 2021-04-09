var request = require('request');

module.exports = function(application){
    var mod = '/settings/';

    application.post(mod+'getPublic', function(req, res){
        application.app.controllers.settings.getSettingsPublic(application,req,res);
    })

    application.post(mod+'get', function(req, res){
        application.app.controllers.settings.getSettings(application,req,res);
    })

    application.post(mod+'update', function(req, res){
        application.app.controllers.settings.update(application,req,res);
    })
}