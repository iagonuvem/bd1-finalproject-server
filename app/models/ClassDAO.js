var request = require('request');

function ClassDAO(conn){
    this._connection = conn;
}

/**
* Busca dados de uma turma, se a turma não existir -> cria uma nova 
* @author Iago Nuvem
* @params { id da turma }
* @returns {Dados da turma}
*/
ClassDAO.prototype.getById = function(data,res){
	var conn = this._connection;
	var mongoConnected = this._connection.connectToMongo(function(client, db){
	    const collection = db.collection('classes');

	    collection.findOne({'class_id' : data.class_id}, function(err, result){
	        if(err){
	        	reject(err);
	        }

	        if(result == null){
	        	create(data, conn); 
	        }
	        else{
				res.send(result);
			}
	        
	    });

	    client.close();
	});
	var create = function(data, conn){
		
		var c = {
			"class_id": data.class_id,
			"chat": []
		}
		var mongoConnected = conn.connectToMongo(function(client, db){
		    const collection = db.collection('classes');

		    collection.insertOne(c, function(err,response){
	            if(err){
		            reject(err);
		        }
	            res.send(response.ops[0]);
	        });

		    client.close();
		});		
	}

}

/**
* Busca dados de uma turma, se a turma não existir -> cria uma nova 
* @author Iago Nuvem
* @params { id da turma  } _id
* @params { JSON com chat } data
* @params { Dados para resposta } res
* @returns {JSON}
*/
ClassDAO.prototype.update = function(_id,data,res){
	// console.log(data);
	// console.log(_id);
	var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('classes');
        // console.log(data);
        collection.updateOne({_id : _id},{$addToSet: {chat: {$each: data}}}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar turma!'});
                throw err;
            }

            // console.log(obj.result);
            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'turma alterada com sucesso!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Nenhum dado foi modificado!'});
            }
        });

        client.close();
    });
}

module.exports = function(){
	return ClassDAO;
}