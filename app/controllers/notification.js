var ObjectID = require('mongodb').ObjectID;
var request = require('request');

/**
 * Retorna todas notificações por unidade
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getByUnit = function(application, req, res){
	var data = {
    	'api_key': req.body.api_key
    }

    if(!data.api_key){
        res.send({'ok': 0, 'msg': 'Faltam dados para completar a requisição'});
        return;
    }

	var connection = new application.config.dbConnection();
    var NotificationDAO = new application.app.models.NotificationDAO(connection);
    
    NotificationDAO.getByUnit(data,res);
}


/**
 * Cria uma nova notificação
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.new = function(application, req, res){
	var data = {
    	author:{
            _id: ObjectID(req.body.author._id),
            name: req.body.author.name
        },
        title: req.body.title,
        msg: req.body.title,
        created_at: new Date(),
        date: new Date(req.body.date),
        api_key: req.body.api_key
    }
    
    if(!data.api_key || !data.title || !data.msg || !data.date || !data.author._id || !data.author.name){
        res.send({'ok': 0, 'msg': 'Faltam dados para completar a requisição'});
        return;
    }

    if(req.body.trigger){
        data.trigger = req.body.trigger;
    }

	var connection = new application.config.dbConnection();
    var NotificationDAO = new application.app.models.NotificationDAO(connection);
    // console.log(data);
    NotificationDAO.new(data,res);
}

/**
 * Deleta uma notificação
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.delete = function(application, req, res){
    var _id = req.body._id;
    if(!_id){
        res.send({'ok': 0, 'msg': 'Faltam dados para completar a requisição'});
        return;
    }else{
        _id = ObjectID(_id); 
    }
    var data = {
    	'_id': _id
    }

	var connection = new application.config.dbConnection();
    var NotificationDAO = new application.app.models.NotificationDAO(connection);
    
    NotificationDAO.delete(data,res);
}

