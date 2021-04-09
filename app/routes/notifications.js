module.exports = function(application){
    var mod = '/notifications/';

    application.post(mod+'new', function(req, res){
        application.app.controllers.notification.new(application,req,res);
    })

    application.post(mod+'delete', function(req, res){
        application.app.controllers.notification.delete(application,req,res);
    })

    application.post(mod+'getByUnit', function(req, res){
        application.app.controllers.notification.getByUnit(application,req,res);
    })
}