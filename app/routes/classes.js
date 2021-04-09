module.exports = function(application){
    var mod = '/classes/';

    application.post(mod+'getById', function(req, res){
        application.app.controllers.class.getById(application,req,res);
    })

    application.post(mod+'update', function(req, res){
        application.app.controllers.class.update(application,req,res);
    })

}