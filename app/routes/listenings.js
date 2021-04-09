module.exports = function(application){
    var mod = '/listenings/';

    application.get(mod+'getAll', function(req, res){
        application.app.controllers.listening.getAll(application,req,res);
    })

}