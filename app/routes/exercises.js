var request = require('request');

module.exports = function(application){
    var mod = '/exercises/';

    application.get(mod+'getAll', function(req, res){
        application.app.controllers.exercise.getAll(application,req,res);
    })

    application.post(mod+'getByLevel', function(req, res){
        application.app.controllers.exercise.getByLevel(application,req,res);
    })

    application.post(mod+'getById', function(req, res){
        application.app.controllers.exercise.getById(application,req,res);
    })

    application.post(mod+'update', function(req, res){
        application.app.controllers.exercise.update(application,req,res);
    })

    application.post(mod+'insert', function(req, res){
        application.app.controllers.exercise.insert(application,req,res);
    })

    application.post(mod+'delete', function(req, res){
        application.app.controllers.exercise.delete(application,req,res);
    })
}