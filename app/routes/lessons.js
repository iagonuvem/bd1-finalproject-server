var request = require('request');

module.exports = function(application){
    var mod = '/lessons/';

    application.post(mod+'fill', function(req, res){
        application.app.controllers.lesson.fillLessons(application,req,res);
    })

    application.post(mod+'getAllByClass', function(req, res){
        application.app.controllers.lesson.getAllByClass(application,req,res);
    })
}