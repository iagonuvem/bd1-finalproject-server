var ObjectID = require('mongodb').ObjectID;
var request = require('request');

/**
 * Retorna dados de uma turma, caso não exista, cria uma nova
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getById = function(application, req, res){
	var data = {
    	'class_id': req.body.class_id
    }

	var connection = new application.config.dbConnection();
    var ClassDAO = new application.app.models.ClassDAO(connection);
    
    ClassDAO.getById(data,res);
}

/**
 * Atualiza turma
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.update = function(application, req, res){
	var data = {
    	'_id': ObjectID(req.body._id),
    	'chat' : req.body.chat
    }

	var connection = new application.config.dbConnection();
    var ClassDAO = new application.app.models.ClassDAO(connection);
    
    ClassDAO.update(data._id,data.chat,res);
}