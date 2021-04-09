var ObjectID = require('mongodb').ObjectID;
var request = require('request');

module.exports.fillLessons = function(application,req,res){
	async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }
    const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

	var connection = new application.config.dbConnection();
    var LessonDAO = new application.app.models.LessonDAO(connection);
    var apiConfig = new application.config.apiConfig(req.body.api_key);
    
    var options = {
          url: apiConfig._url+'/classes',
          headers: {
            'api_key': apiConfig._apiKey
          }
        };
    request.get(options, function(error, response, body) {
    	if (!error && response.statusCode == 200) {
    		var arr = JSON.parse(body);
    		var fill = [];
    		new Promise(function(resolve, reject){
    			for(var i in arr){
    				if(arr[i].situation == 1){
    					fill.push(arr[i].class_id);
    				}
    			}
    			resolve(fill);
    		})
    		.then(function(data){
    			const fullData = async () => {
                    var fill = [];
                    await asyncForEach(data, async (e) => {
                      await waitFor(50);
                      request.post({
                            url: apiConfig._url+'/lessons',
                            headers: options.headers,
                            body: {
                            	"class_id": e,
                            	"situation": 0
                            },
                            json: true
                        },function(error, response, body){
                        	for(var i in body){
                        		fill.push(body[i]);
                        	}
                            
                        })
                    })
                    res.send(fill);
                }
                fullData();
    		})
    		.catch(function(err){
    			throw err;
    		})
    		
    	}
    	else{
    		throw error;
    	}
    })
}

/**
 * Método responsavel por buscar todas as lições do usuário
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAllByClass = function(application, req, res){
    var connection = new application.config.dbConnection();
    var LessonDAO = new application.app.models.LessonDAO(connection);
    var data = {
        'student_id' : req.body.student_id,
        'class_id' : req.body.class_id,
        'situation' : req.body.situation
    }

    LessonDAO.getAllByClass(data,res);
}