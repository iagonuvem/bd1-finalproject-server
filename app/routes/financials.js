module.exports = function(application){
    var mod = '/financials/';

    application.post(mod+'getAll', function(req, res){
        application.app.controllers.financial.getAll(application,req,res);
    })

}