var request = require('request');

module.exports = function(application){
    var mod = '/events/';

    application.post(mod+'getAllByUnit', function(req, res){
        application.app.controllers.event.getAllByUnit(application,req,res);
    })

    application.get(mod+'getAll', function(req, res){
        application.app.controllers.event.getAll(application,req,res);
    })

    application.post(mod+'getById', function(req, res){
        application.app.controllers.event.getById(application,req,res);
    })

    application.post(mod+'update', function(req, res){
        application.app.controllers.event.update(application,req,res);
    })

    application.post(mod+'insert', function(req, res){
        application.app.controllers.event.insert(application,req,res);
    })

    application.post(mod+'delete', function(req, res){
        application.app.controllers.event.delete(application,req,res);
    })
}