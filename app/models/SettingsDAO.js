var request = require('request');

function SettingsDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Todos os parceiros}
*/
SettingsDAO.prototype.getSettings = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('app-settings');

        collection.find().toArray(function(err, result){
            // console.log(result);
            if(err){
                res.send({'success': false, 'msg': 'Falha ao buscar dados'})
            }else{
                res.send(result[0]);  
            }
            
        });

        client.close();
    });
}


/**
 * NÃO RETORNA _ID
* @author Iago Nuvem
* @returns {Todos os parceiros}
*/
SettingsDAO.prototype.getSettingsPublic = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('app-settings');

        collection.find({}, {_id: 0}).toArray(function(err, result){
            // console.log(result);
            if(err){
                res.send({'success': false, 'msg': 'Falha ao buscar dados'})
            }else{
                res.send(result[0]);  
            }
            
        });

        client.close();
    });
}

/**
 * Altera configurações
 * @param {dados do usuario} data
 * @author Iago Nuvem
 */
SettingsDAO.prototype.update = function(_id,data, res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('app-settings');
        // console.log(data);
        collection.updateOne({_id : _id},{$set: data}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar configurações!'});
                throw err;
            }

            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'Configurações alteradas com sucesso!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Nenhum dado foi modificado!'});
            }
        });

        client.close();
    });
}

module.exports = function(){
	return SettingsDAO;
}