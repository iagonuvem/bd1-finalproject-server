module.exports = function(application){
    const mod = '/tutoring/';

    application.post(mod+'getTutorsByUnit', function(req, res){
        application.app.controllers.tutoring.getTutorsByUnit(application,req,res);
    })

    application.post(mod+'getOAuthUrl', function(req, res){
        application.app.controllers.tutoring.getOAuthUrl(application,req,res);
    })

    application.get(mod+'getCredentials', function(req, res){
        application.app.controllers.tutoring.getCredentials(application,req,res);
    })

    application.post(mod+'removeEvent', function(req, res){
        application.app.controllers.tutoring.removeEvent(application,req,res);
    })

    application.post(mod+'setEvent', function(req, res){
        application.app.controllers.tutoring.setEvent(application,req,res);
    })

    application.post(mod+'insertTutor', function(req, res){
        application.app.controllers.tutoring.insertTutor(application,req,res);
    })
}