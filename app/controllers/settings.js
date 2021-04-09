var ObjectID = require('mongodb').ObjectID;

/**
 * Retorna os dados de configuração USUÁRIO
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getSettingsPublic = async function(application, req, res){
    var _id = req.body._id;
    
    if(!_id){
        res.send({
            "success" : false,
            "msg": "Faltam dados para verificar a permissão de acesso"
        });
        return;
    }else{
        _id = ObjectID(_id);
    }

    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var SettingsDAO = new application.app.models.SettingsDAO(connection);
    

    const user = await UserDAO.getByIdAsync(_id,res);
    
    if(user['ok'] != 1){
        res.send({
            "success" : false,
            "msg": "Não autorizado!"
        });
        return;
    }else{
        SettingsDAO.getSettingsPublic(res);
    }    
}

/**
 * Retorna os dados de configuração ADMIN
 * difere apenas no retorno da propriedade "_id"
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getSettings = async function(application, req, res){
    const cpf = req.body.cpf;
    const password = req.body.password;
    const api_key = req.body.api_key;
    const access_type = req.body.access_type;
    
    if(!cpf || !password || !api_key || !access_type){
        res.send({
            "success" : false,
            "msg": "Faltam dados para verificar a permissão de acesso"
        });
        return;
    }

    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var SettingsDAO = new application.app.models.SettingsDAO(connection);
    
    var user = {
        'cpf': cpf,
        'password' : application.app.customs.encrypt.md5(password),
        'api_key': api_key,
        'access_type': access_type
    }
    const userLogin = await UserDAO.loginAsync(user,res);
    
    if(userLogin['ok'] != 1){
        res.send({
            "success" : false,
            "msg": "Não autorizado!"
        });
        return;
    }
    else{
        SettingsDAO.getSettings(res);
    }    
}

/**
 * Módulo responsável por alterar dados de configuração
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.update = async function(application,req,res){
    // console.log(req.body);
    var _id = req.body._id;
    var student_id = req.body.student_id;

    if(!_id){
        res.send({'success' : false, 'msg' : 'Não é possível atualizar sem a referência!'});
        return;
    }
    else{
        _id = ObjectID(_id);
    }

    const cpf = req.body.cpf;
    const password = req.body.password;
    const api_key = req.body.api_key;
    const access_type = req.body.access_type;
    
    if(!cpf || !password || !api_key || !access_type){
        res.send({
            "success" : false,
            "msg": "Faltam dados para verificar a permissão de acesso"
        });
        return;
    }

    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);
    let SettingsDAO = new application.app.models.SettingsDAO(connection);
    
    var user = {
        'cpf': cpf,
        'password' : application.app.customs.encrypt.md5(password),
        'api_key': api_key,
        'access_type': access_type
    }
    const userLogin = await UserDAO.loginAsync(user,res);
    
    if(userLogin['ok'] != 1){
        res.send({
            "success" : false,
            "msg": "Não autorizado!"
        });
        return;
    }else{
        let data = {
            'instagram_access_token' : req.body.instagram_access_token,
        };
    
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
    
        data['last_update_date'] = new Date();
        data['last_update_by'] = cpf;
    
        // console.log(data);
        SettingsDAO.update(_id,data,res);
    }  
    
}