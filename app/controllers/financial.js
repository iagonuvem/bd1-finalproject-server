var ObjectID = require('mongodb').ObjectID;
var request = require('request');

/**
 * Retorna todos os Boletos do Aluno
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
	var data = {
    	'student_id': req.body.student_id,
    	'api_key': req.body.api_key,
    	'page_number': req.body.page_number
    }

	var connection = new application.config.dbConnection();
    var FinancialDAO = new application.app.models.FinancialDAO(connection);
    var apiConfig = new application.config.apiConfig(data.api_key);

    var options = {
	    url: apiConfig._url+'/receivables',
	     body: {
			'student_id': data.student_id,
			'page_number': data.page_number
		},
	    headers: {
	        'api_key': apiConfig._apiKey
	    },
	    json:true
	};
	new Promise(function(resolve,reject){
	    request.post(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				if(!body[1]){ // Caso não exista mais alguma pagina valida (consultar API SPONTE)
				    resolve({
				    	"status": 0,
				    	"msg": "Não existem registros nessa pagina"
				    });
				}
				else{
				    resolve({
				    	"status": 1,
				    	"data": body
				    })		            	
				}
			}
			else{
				reject(error);
			}
		})
	})
	.then(function(data){
	    res.send(data);
	})
	.catch(function(error){
	    throw error;
	})
    // FinancialDAO.getAll(user,res);
}