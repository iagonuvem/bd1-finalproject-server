var ObjectID = require('mongodb').ObjectID;
var request = require('request');

/**
 * Busca todos os exercicios com a data superior à data atual
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
    var connection = new application.config.dbConnection();
    var ExerciseDAO = new application.app.models.ExerciseDAO(connection);
    
    ExerciseDAO.getAll(res);
}
/**
 * Retorna dados do exercicio
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getById = function(application, req, res){
	var _id = req.body._id;
    if(!_id){
        res.send({
            "success": false,
            "msg": "Não é possível buscar sem a referência"
        })
        return;
    }
    else{
        _id = ObjectID(req.body._id);
    }

	var connection = new application.config.dbConnection();
    var ExerciseDAO = new application.app.models.ExerciseDAO(connection);
    
    ExerciseDAO.getById(_id,res);
}

module.exports.getByLevel = function(application, req, res){
    var level = req.body.level;
    if(!level){
        res.send({
            "success": false,
            "msg": "Não é possível buscar sem a referência"
        })
        return;
    }

    var connection = new application.config.dbConnection();
    var ExerciseDAO = new application.app.models.ExerciseDAO(connection);
    
    ExerciseDAO.getByLevel(level,res);
}

/**
 * Atualiza o exercicio
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.update = function(application, req, res){
	var _id = req.body._id;
    if(!_id){
        res.send({
            "success": false,
            "msg": "Não é possível buscar sem a referência"
        })
        return;
    }
    else{
        _id = ObjectID(req.body._id);
    }

    var data = {
    	
    }

	var connection = new application.config.dbConnection();
    var ExerciseDAO = new application.app.models.ExerciseDAO(connection);
    
    var data = {
        "statement": req.body.statement,
        "level": req.body.level,
        "options": req.body.options,
        "clarification": req.body.clarification
    }

    var keys = Object.keys(data);
    for(var i in keys){
        if(req.body.hasOwnProperty(keys[i])){
            if(req.body[keys[i]] != null && req.body[keys[i]] != ''){
                data[keys[i]] = req.body[keys[i]];
            }else{
                delete data[keys[i]];
            }
        }
        else{
            delete data[keys[i]];
        }
    }

    ExerciseDAO.update(_id,data,res);
}

/**
 * Insere um exercicio no BD
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.insert = function(application, req, res){
    var connection = new application.config.dbConnection();
    var ExerciseDAO = new application.app.models.ExerciseDAO(connection);
        
    var data = {
        "statement": req.body.statement,
        "level": req.body.level,
        "options": req.body.options,
        "clarification": req.body.clarification
    }

    ExerciseDAO.insert(data,res);
}

/**
 * Deleta um exercicio do BD
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

	var connection = new application.config.dbConnection();
    var ExerciseDAO = new application.app.models.ExerciseDAO(connection);
    
    ExerciseDAO.delete(_id,res);
}