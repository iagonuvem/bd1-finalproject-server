var request = require('request');

function EventDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Eventos por unidade}
*/
EventDAO.prototype.getAllByUnit = function(api_key,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('events');

        collection.find({"api_key" : api_key}).sort({"date":1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {Todos os eventos com a data superior à data atual}
*/
EventDAO.prototype.getAll = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('events');

        collection.find({"date" : { $gte : new Date()}}).sort({"date":1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {Dados de um evento}
*/
EventDAO.prototype.getById = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('events');

        collection.findOne({"_id" : _id}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {atualiza dados de um evento}
*/
EventDAO.prototype.insert = function(data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
		    const collection = db.collection('events');

		    collection.insertOne(data, function(err,response){
	            if(err){
	            	res.send({'success': false, 'msg' : 'Falha ao inserir evento!'});
		            throw err;
		        }
	            res.send({'success': true, 'msg' : 'Evento inserido com sucesso!'});
	        });

		    client.close();
		});	
}

/**
* @author Iago Nuvem
* @returns {atualiza dados de um evento}
*/
EventDAO.prototype.update = function(_id,data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('events');
        // console.log(data);
        collection.updateOne({_id : _id},{$set: data}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar Evento!'});
                throw err;
            }

            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'Evento alterado com sucesso!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Nenhum dado foi modificado!'});
            }
        });

        client.close();
    }); 
}

/**
* @author Iago Nuvem
* @returns {deleta um evento}
*/
EventDAO.prototype.delete = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('events');

        collection.remove({_id : _id},function(err, obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao deletar evento!'});
                throw err;
            }

            // console.log(obj.result);
            if(obj.result.n != 0){
                res.send({'success': true, 'msg' : ' Evento deletado!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Evento não cadastrado, impossível deletar!'});
            }
        });

        client.close();
    });
}


module.exports = function(){
	return EventDAO;
}