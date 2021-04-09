var fs = require('fs');

function UserDAO(conn){
    this._connection = conn;
}

UserDAO.prototype.fillUsers = function(users){
    let conn = this._connection;
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');
        collection.createIndex( {student_id: 1, name: 1}, { unique: true } )
        collection.insertMany(users, {ordered: false}, function(err,result){
            if(err) {
                // Ignora erro de dados duplicados, pois não realiza inserção deles, apenas os ignora
                if(err.code == '11000'){ 
                    // console.log({
                    //     "ok" : 1,
                    //     "msg": "Banco de usuários preenchido!"
                    // })  
                }
                else{
                    console.log({
                        "ok" : 0,
                        "msg": "Pode ter ocorrido uma falha ao preencher banco de usuários!",
                        "data": err
                    }) 
                }
                
            }
            else{
                // console.log({
                //     "ok" : 1,
                //     "msg": "Banco de usuários preenchido!",
                //     "data": result
                // })  
            }
            client.close();
        })
    });

}

/**
* Insere um feedback do usuario no banco
* @author Iago Nuvem
* @returns {status}
*/
UserDAO.prototype.feedback = function(data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('feedbacks');

        collection.insertOne(data, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao inserir feedback!'});
                throw err;
            }

            res.send({'success': true, 'msg' : 'feedback inserido com sucesso!'});
        });

        client.close();
    });
}

/**
* Busca usuário por nome
* @author Iago Nuvem
* @returns {Dados do usuario}
*/
UserDAO.prototype.getByName = function(user,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');

        collection.findOne({'name' : user.name}, function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* Busca pelo email ASSINCRONO
* @author Iago Nuvem
* @returns {Dados do estudante}
*/
UserDAO.prototype.getByEmailAsync = async function(email){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');
    return new Promise((resolve, reject) => {

        collection.findOne({ 'email': email }, function (err, result) {
            if (err) {
                reject(err);
            }

            if (!result) {
                resolve({
                    "ok": 0,
                    "msg": "Usuário Inexistente!"
                });
            }else {
                resolve({
                    "ok" : 1,
                    "msg": "Usuário Existente!",
                    "data": result
                });
            }
        });
    });
}

/**
* Busca por parametros ASSINCRONO
* @author Iago Nuvem
* @returns {Dados do usuário}
*/
UserDAO.prototype.getByParamsAsync = async function(params){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');

    return new Promise((resolve, reject) => {

        collection.find(params).toArray(function(err, result){
            if(err){
                reject(err);
            }
            resolve(result);  
        });
    });
}

/**
* Busca pelo _id ASSINCRONO
* @author Iago Nuvem
* @returns {Dados do estudante}
*/
UserDAO.prototype.getByIdAsync = async function(_id,res){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');
    return new Promise((resolve, reject) => {

        collection.findOne({ '_id': _id }, function (err, result) {
            if (err) {
                reject(err);
            }

            if (!result) {
                resolve({
                    "ok": 0,
                    "msg": "Usuário Inexistente!"
                });
            }else {
                resolve({
                    "ok" : 1,
                    "msg": "Usuário Existente!",
                    "data": result
                });
            }
        });
    });
}

/**
* Insere Usuário ASSINCRONO
* @author Iago Nuvem
* @returns {Dados do estudante}
*/
UserDAO.prototype.insertAsync = async function(data){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');
    return new Promise((resolve, reject) => {
        try {
            collection.insertOne(data, function(err,obj){
                if(err){
                    console.log(err)
                    reject({'success': false, 'msg' : 'Falha ao inserir usuário!'});
                    // throw err;
                }
                resolve({'success': true, 'msg' : 'Usuário Cadastrado com sucesso!'});
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
* Busca por student_id
* @author Iago Nuvem
* @returns {Dados do estudante}
*/
UserDAO.prototype.getById = function(user,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');

        collection.findOne({'student_id' : user.student_id}, function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* Busca usuário por _id Mongo
* @author Iago Nuvem
* @returns {Dados do usuario}
*/
UserDAO.prototype.getByMongoId = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');

        collection.findOne({'_id' : _id}, function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
 * realiza o Login ASSÍNCRONA
 * @author Iago Nuvem
 * @returns {Status, msg}
 */
UserDAO.prototype.loginAsync = async function(user,res){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');
    return new Promise((resolve, reject) => {
        let query = [{ 'api_key': user.api_key }];
        if (user.cpf) {
            query.push({ 'cpf': user.cpf });
        } else {
            query.push({ 'spontenet_username': user.spontenet_username })
        }
        collection.findOne({ $and: query }, function (err, result) {
            if (err) {
                reject(err);
            }

            if (!result) {
                resolve({
                    "ok": 0,
                    "msg": "Usuário Inexistente!"
                });
            }
            else {
                if(result.password === undefined){
                    resolve({
                        "ok" : 0,
                        "msg": "Primeiro acesso, cadastrar uma senha!",
                        "data": result
                    });
                }
                else{
                    if(result.password == user.password && result.api_key == user.api_key){
                        resolve({
                            "ok" : 1,
                            "msg": "Usuário Logado!",
                            "data": result
                        });
                    }
                    else if(result.api_key != user.api_key){
                        resolve({
                            "ok" : 0,
                            "msg": "Localidade Incorreta!",
                        });
                    }
                    else{
                        resolve({
                            "ok" : 0,
                            "msg": "Senha Incorreta!",
                        });
                    } 
                }
            }
        });
    });
}

/**
 * realiza o login
 * @author Iago Nuvem
 * @returns {Status, msg}
 */
UserDAO.prototype.login = async function(user,res){
    let conn = this._connection;
    new Promise(function(resolve,reject){
        var mongoConnected = conn.connectToMongo(function(client, db){
            const collection = db.collection('users');
            let query = [{'api_key': user.api_key}];
            if(user.cpf){
                query.push({'cpf' : user.cpf});
            }else{
                query.push({'spontenet_username': user.spontenet_username})
            }
            collection.findOne({$and: query}, function(err, result){
                    if(err){
                        reject(err);
                    }

                    if(!result){
                        resolve({
                            "ok" : 0,
                            "msg": "Usuário Inexistente!"
                        });
                    }
                    else{
                        resolve({
                            "ok" : 1,
                            "data": result
                        });
                    }
                client.close();
            }); 
        });
    })
    .then(function(result){
        if(result.ok == 0){
            res.send(result);
        }
        else{
            // console.log(user);
            // console.log(result);
            // Caso não possua senha cadastrada no bd..
            if(result.data.password === undefined){
                res.send({
                    "ok" : 0,
                    "msg": "Primeiro acesso, cadastrar uma senha!",
                    "data": result.data
                });
            }
            else{
                if(result.data.password == user.password && result.data.api_key == user.api_key){
                    res.send({
                        "ok" : 1,
                        "msg": "Usuário Logado!",
                        "data": result.data
                    });
                }
                else if(result.data.api_key != user.api_key){
                    res.send({
                        "ok" : 0,
                        "msg": "Localidade Incorreta!",
                    });
                }
                else{
                    res.send({
                        "ok" : 0,
                        "msg": "Senha Incorreta!",
                    });
                } 
            }
        }
    })
    .catch(function(err){
        throw err;
    })
}


/**
 * Busca todos os usuários
 * @author Iago Nuvem
 * @returns {Dados dos usuarios}
 */
UserDAO.prototype.getAll = async function(){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');
    return new Promise((resolve,reject) => {
        collection.find().toArray(function(err, result){
            // console.log(result);
            if(err){
                reject(err);
            }
            resolve(result);  
        });
    })
}

/**
 * Busca todos os usuários
 * @author Iago Nuvem
 * @returns {Dados dos usuarios}
 */
UserDAO.prototype.exportUsers = function(res){
    var mongoConnected = this._connection.connectToMongo(async function(client, db){
        let arr = [];
        await db.collection('users').find().toArray(function(err, result){
            if(err){
                throw err;
            }
            
            for(var i in result){
                var date = new Date(result[i].birthdate);
                var password = ''+(date.getDate())+(date.getMonth()+1)+date.getFullYear();
                
                var unit = '';
                if(result[i].api_key == '0935C4'){
                    unit = 'João Monlevade';
                }
                else if(result[i].api_key == '3264F7'){
                    unit = 'Contagem';
                }
                else if(result[i].api_key == '068EE5'){
                    unit = 'Caratinga';
                }

                arr.push({
                    "name": result[i].name,
                    "unit": unit,
                    "login": result[i].spontenet_username,
                    "password": password
                });
            }
            //DELETA O ARQUIVO ANTES DE SOBRESCREVER PARA EVITAR LIXO
            // fs.unlink('./users.json', function (err) {
            //   if (err) throw err;
            // });

            fs.appendFile('./users.json', JSON.stringify(arr) ,function(err){
                if(err) throw err;
            });
        });
        
        // client.close();
    });
}

/**
 * Deleta um usuário do banco
 * @author Iago Nuvem
 * @returns {JSON com status e mensagem}
 */
UserDAO.prototype.delete = function(_id, res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');

        collection.remove({_id : _id},function(err, obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao deletar usuário!'});
                throw err;
            }

            // console.log(obj.result);
            if(obj.result.n != 0){
                res.send({'success': true, 'msg' : ' Usuário deletado!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Usuário não cadastrado, impossível deletar!'});
            }
        });

        client.close();
    });
}

/**
 * Insere um usuario
 * @param {dados do usuario} data
 * @author Iago Nuvem
 */
UserDAO.prototype.insert = function(data, res){
    let conn = this._connection;
    new Promise(function(resolve,reject){
        

        var mongoConnected = conn.connectToMongo(function(client, db){
            const collection = db.collection('users');

            collection.findOne({'nickname' : data.nickname}, function(err, result){
                if(err){
                    reject(err);
                }

                if(!result){ // Se não houver usuário com o mesmo nickname, procede com o cadastro
                    resolve(1);
                }
                else{
                    resolve(0);
                }
            });

            client.close();
        });
    })
    .then(function(ok){
        // console.log(data);
        if(ok == 1){
           var mongoConnected = conn.connectToMongo(function(client, db){
                const collection = db.collection('users');

                collection.insertOne(data, function(err,obj){
                    if(err){
                        res.send({'success': false, 'msg' : 'Falha ao inserir usuário!'});
                        throw err;
                    }

                    res.send({'success': true, 'msg' : 'Usuário Cadastrado com sucesso!'});
                });
            }) 
        }
        else{
           res.send({'success': false, 'msg' : 'Apelido já existente!'}); 
        }
        
    })
    .catch(function(err){
        throw err;
    })
}

/**
 * Altera um usuário
 * @param {dados do usuario} data
 * @author Iago Nuvem
 */
UserDAO.prototype.update = function(_id,data, res){
    // console.log(data);
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');
        // console.log(data);
        collection.updateOne({_id : _id},{$set: data}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar usuário!'});
                throw err;
            }
            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'Usuário alterado com sucesso!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Nenhum dado foi modificado!'});
            }
        });

        client.close();
    });
}

/**
 * Altera um usuário ASSINCRONO
 * @param {dados do usuario} data
 * @author Iago Nuvem
 */
UserDAO.prototype.updateAsync = async function(_id,data){
    let mongoConnected = await this._connection.connectToMongoAsync();
    const collection = mongoConnected.db.collection('users');
    return new Promise((resolve,reject) => {
        collection.updateOne({_id : _id},{$set: data}, function(err,obj){
            if(err){
                // throw err;
                reject(err);
            }
            // console.log(obj.result);
            if(obj.result.nModified > 0){
                resolve(true);
            }else{
                resolve(false);
            }     
        })
    }).then(function(data){
        return data;
        // mongoConnected.client.close();
    })
    .catch((err) => {
        throw err;
    }); 
}

/**
 * Altera o tipo de usuário no sistema
 * @param {Id do usuario} _id
 * @param {Tipo do usuario (0 ou 1)} type
 * @param {Response do Express} res
 * @author Iago Nuvem
 */
UserDAO.prototype.setAdmin = function(_id,type,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('users');
        // console.log(data);
        collection.updateOne({_id : _id},{$set: {admin: type}}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar usuário!'});
                throw err;
            }

            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'Usuário alterado com sucesso!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Nenhum dado foi modificado!'});
            }
        });

        client.close();
    });
}

module.exports = function(){
    return UserDAO;
}