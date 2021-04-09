var ObjectID = require('mongodb').ObjectID;
var request = require('request');

module.exports.fillUsers = function(req, res){
    
}
/**
* Método para salvar o feedback de um aluno
* @author Iago Nuvem
* @param {Instancia do Express} application 
* @param {Dados da requisição} req 
* @param {Dados para resposta} res
*/
module.exports.feedback = function(application,req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var feedback = {
        'student_id' : parseInt(req.body.student_id),
        'msg' : req.body.msg,
        'api_key': req.body.api_key,
        'date': new Date()
    }

    UserDAO.feedback(feedback,res);
}
/**
 * Método de login
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.login = async function(application, req, res){
    const spontenet_username = req.body.spontenet_username;
    const cpf = req.body.cpf;
    const access_type = req.body.access_type;

    if(!access_type){
        res.send({
            "ok" : 0,
            "msg": "Não é possível logar sem especificar o tipo de usuário."
        });
        return;
    }

    var user = {
        'password' : application.app.customs.encrypt.md5(req.body.password),
        'api_key': req.body.api_key
    }

    if(!cpf && spontenet_username){
        user['spontenet_username'] = spontenet_username.toString();
    }

    if(cpf && access_type != 4){
        user['cpf'] = cpf;
    }

    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    // console.log(user);
    

    const userLogin = await UserDAO.loginAsync(user,res);
    if(userLogin['ok'] == 1 && userLogin['data']){
        const updateLastLogin = await UserDAO.updateAsync(ObjectID(userLogin['data']._id), {'last_login': new Date()});
    }
    res.send(userLogin);
}

/**
 * Método responsavel por buscar usuário pelo nome
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getByName = function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var user = {
        'name' : req.body.name.toString().toLowerCase()
    }

    UserDAO.getByName(user,res);
}

/**
 * Método responsavel por buscar usuário pelo student_id (SPONTE)
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getByMongoId = async function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var user = {
        '_id' : ObjectID(req.body._id)
    }

    UserDAO.getByMongoId(user._id, res);
}

/**
 * Método responsavel por buscar usuário pelo student_id (SPONTE)
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getById = function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var user = {
        'student_id' : req.body.student_id
    }

    UserDAO.getById(user,res);
}

/**
 * Módulo responsável por buscar todos os usuários
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getAll = function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    UserDAO.getAll(res);
}

/**
 * Módulo responsável por buscar todos os usuários
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.exportUsers = async function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    UserDAO.exportUsers();
}

/**
 * Módulo responsável por inserir um usuario
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.insert = function(application,req,res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);

    var data = {
        'name' : req.body.name,
        'nickname': req.body.nickname.toString().toLowerCase(),
        'phone': req.body.phone,
        'password' : application.app.customs.encrypt.md5(req.body.password),
        'img' : 'user.png',
        'admin': 0
    };
    // console.log(data);
    UserDAO.insert(data,res);
}

module.exports.resetPassword = async function (application, req, res) {
    var email = req.body.email;
    var newPassword = new Date().getTime();

    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);
    
    if(!email){
        res.send({'success' : false, 'msg' : 'Não é possível enviar a senha para um email inexistente!'});
        return;
    }

    let userData = await UserDAO.getByEmailAsync(email);
    if(userData['ok'] == 0){
        res.send({'success' : false, 'msg' : 'Usuário não encontrado pelo email'});
        return;
    }
    let userId = ObjectID(userData.data['_id']);

    let update = await UserDAO.updateAsync(userId,
        {'password': require('../customs/encrypt').md5(newPassword)});
    
    if(update){
        // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    // Set the region 
    AWS.config.update({ region: 'us-east-1' });

    // Create sendEmail params 
    var params = {
        Destination: { /* required */
            ToAddresses: [
                email,
                /* more items */
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: "<body><h1>Seus Dados de Acesso do APP Seed</h1><br/><p><strong>Login:</strong> "+userData['spontenet_username']+"<br/><strong>Senha:</strong>"+newPassword+"</p></body>"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Dados de Acesso APP Seed'
            }
        },
        Source: 'dev@seedidiomas.com' /* required */
    };

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

    // console.log(userData);
    // Handle promise's fulfilled/rejected states
    sendPromise.then(
        async function (data) {
            // console.log(data);
            res.send({'success': true, "msg": "Sua senha foi atualizada, verifique seu no seu email seus dados de acesso."})
        }).catch(
            function (err) {
                res.send({'success': false, "msg": "Tivemos problemas ao enviar o email de recuperação, procure o administrador."})
                // console.error(err, err.stack);
                return;
        });
    }else{
        res.send({'success': false, 'msg': 'Falha ao resetar senha!'});
        return;
    }
    // res.send(userId);
}

/**
 * Módulo responsável por alterar dados do usuário
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.update = async function(application,req,res){
    // console.log(req.body);
    var _id = req.body._id;
    var student_id = req.body.student_id;

    if(!req.body.api_key){
        res.send({
            "success": false,
            "msg" : "Chave da API não encontrada."
        })
    }
    else if(!_id){
        res.send({'success' : false, 'msg' : 'Não é possível atualizar sem a referência!'});
    }
    else{
        _id = ObjectID(_id);
    }


    var apiConfig = new application.config.apiConfig(req.body.api_key);
    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);
    
    let data = {
        'name' : req.body.name,
        'email': req.body.email,
        'birthdate': req.body.birthdate,
        'cell_phone': req.body.cell_phone,
        'job': req.body.job,
        'photo': req.body.photo,
        'home_phone': req.body.home_phone,
        'zip_code': req.body.zip_code,
        'address': req.body.address,
        'number': req.body.number,
        'district': req.body.district,
        'city': req.body.city,
        'cpf': req.body.cpf,
        'rg': req.body.rg,
        'password': require('../customs/encrypt').md5(req.body.password),
        'spontenet_password': req.body.spontenet_password
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
    // console.log(data);
    var options = {
          url: apiConfig._url+'/students/'+student_id,
          headers: {
            'api_key': apiConfig._apiKey
          }
        };

    await request.put({
        url: options.url,
        headers: options.headers,
        body: data,
        json: true
    },function(error, response, body){
        if(error){
            res.send({
                "success": false,
                "msg" : "Erro ao comunicar com o Sistema Sponte."
            })
        }
    })
    
    UserDAO.update(_id,data,res);
}

/**
 * Módulo responsável por deletar um usuario
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.delete = function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var _id = ObjectID(req.body._id);
    UserDAO.delete(_id,res);
}

/**
 * Módulo responsável por tornar um usuário admin
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.setAdmin = function(application, req, res){
    var connection = new application.config.dbConnection();
    var UserDAO = new application.app.models.UserDAO(connection);
    var _id = ObjectID(req.body._id);
    UserDAO.setAdmin(_id,req.body.type,res);
}