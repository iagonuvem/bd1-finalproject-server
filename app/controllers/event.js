var ObjectID = require('mongodb').ObjectID;
var request = require('request');


/**
 * Busca todos os eventos de determinada unidade com a data superior à data atual
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAllByUnit = function(application, req, res){
    const api_key = req.body.api_key;

    if(!api_key){
        res.send({'success': false, 'msg': 'Não é possível buscar sem a referência'})
        return;
    }

    var connection = new application.config.dbConnection();
    var EventDAO = new application.app.models.EventDAO(connection);
    
    EventDAO.getAllByUnit(api_key,res);
}

/**
 * Busca todos os eventos com a data superior à data atual
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
    var connection = new application.config.dbConnection();
    var EventDAO = new application.app.models.EventDAO(connection);
    
    EventDAO.getAll(res);
}
/**
 * Retorna dados do evento
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
    var EventDAO = new application.app.models.EventDAO(connection);
    
    EventDAO.getById(_id,res);
}

/**
 * Atualiza o evento
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

	var connection = new application.config.dbConnection();
    var EventDAO = new application.app.models.EventDAO(connection);
    
    var data = {
        "title": "",
        "short_desc": "",
        "full_desc": "",
        "date": "",
        "location_text": "",
        "lat": "",
        "lon": "",
        "img": ""
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

    EventDAO.update(_id,data,res);
}

/**
 * Insere um evento no BD
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.insert = function(application, req, res){
    var connection = new application.config.dbConnection();
    var EventDAO = new application.app.models.EventDAO(connection);
        
    var data = {
        "title" : req.body.title,
        "short_desc": req.body.short_desc,
        "full_desc": req.body.full_desc,
        "date": new Date(req.body.date),
        "api_key": req.body.api_key,
        "location": {
            "text": req.body.location_text,
            "lat": req.body.lat,
            "lon": req.body.lon 
        },
        "img": req.body.img
    }

    EventDAO.insert(data,res);
}

/**
 * Deleta um evento do BD
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
    var EventDAO = new application.app.models.EventDAO(connection);
    
    EventDAO.delete(_id,res);
}