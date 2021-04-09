var ObjectID = require('mongodb').ObjectID;
var AWS = require("aws-sdk");

/**
 * Busca todas Noticias Ordenado por data
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
    var connection = new application.config.dbConnection();
    var NewsDAO = new application.app.models.NewsDAO(connection);
    
    NewsDAO.getAll(res);
}

/**
 * Busca todas Noticias Por Unidade Ordenado por data
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
    var NewsDAO = new application.app.models.NewsDAO(connection);
    
    NewsDAO.getAllByUnit(api_key,res);
}

/**
 * Retorna dados do noticia
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
    var NewsDAO = new application.app.models.NewsDAO(connection);
    
    NewsDAO.getById(_id,res);
}

/**
 * Atualiza o noticia
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
    var NewsDAO = new application.app.models.NewsDAO(connection);
    
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

    NewsDAO.update(_id,data,res);
}

/**
 * Insere um noticia no BD
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.insert = function(application, req, res){
    var connection = new application.config.dbConnection();
    var NewsDAO = new application.app.models.NewsDAO(connection);
        
    var data = {
        "title" : req.body.title,
        "short_desc": req.body.short_desc,
        "full_desc": req.body.full_desc,
        "date": new Date(),
        "created_by": {
            "user_id": req.body.user_id,
            "user_name": req.body.user_name
        }
    }

    if(req.body.img){ 
        data['img'] = req.body.img;
    };

    if(req.body.api_key){ data['api_key'] = req.body.api_key };

    NewsDAO.insert(data,res);
}

/**
 * Deleta um noticia do BD
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
    var NewsDAO = new application.app.models.NewsDAO(connection);
    
    NewsDAO.delete(_id,res);
}