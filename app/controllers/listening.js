var ObjectID = require('mongodb').ObjectID;
var request = require('request');

/**
 * Retorna todos os albuns de listening
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
	var connection = new application.config.dbConnection();
    var ListeningDAO = new application.app.models.ListeningDAO(connection);
    
    ListeningDAO.getAll(res);
}