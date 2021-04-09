var ObjectID = require('mongodb').ObjectID;
var request = require('request');

/**
 * Retorna todos os parceiros
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
	var connection = new application.config.dbConnection();
    var PartnerDAO = new application.app.models.PartnerDAO(connection);
    
    PartnerDAO.getAll(res);
}