var request = require('request');

module.exports = function(application){
    var mod = '/news/';

    application.get(mod+'getAll', function(req, res){
        application.app.controllers.news.getAll(application,req,res);
    })

    application.post(mod+'getAllByUnit', function(req, res){
        application.app.controllers.news.getAllByUnit(application,req,res);
    })

    application.post(mod+'getById', function(req, res){
        application.app.controllers.news.getById(application,req,res);
    })

    application.post(mod+'update', function(req, res){
        application.app.controllers.news.update(application,req,res);
    })

    application.post(mod+'insert', function(req, res){
        application.app.controllers.news.insert(application,req,res);
    })

    application.post(mod+'delete', function(req, res){
        application.app.controllers.news.delete(application,req,res);
    })
}