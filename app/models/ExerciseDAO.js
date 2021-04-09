var request = require('request');

function ExerciseDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Todos os exercicios, ordenados por nível}
*/
ExerciseDAO.prototype.getAll = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('exercises');

        collection.find().sort({"level":1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {Dados de um exercicio}
*/
ExerciseDAO.prototype.getById = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('exercises');

        collection.findOne({"_id" : _id}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {Exercicios por Nivel}
*/
ExerciseDAO.prototype.getByLevel = function(level,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('exercises');

        collection.find({"level" : level}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}


/**
* @author Iago Nuvem
* @returns {atualiza dados de um exercicio}
*/
ExerciseDAO.prototype.insert = function(data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
		    const collection = db.collection('exercises');

		    collection.insertOne(data, function(err,response){
	            if(err){
	            	res.send({'success': false, 'msg' : 'Falha ao inserir exercicio!'});
		            throw err;
		        }
	            res.send({'success': true, 'msg' : 'Exercicio inserido com sucesso!'});
	        });

		    client.close();
		});	
}

/**
* @author Iago Nuvem
* @returns {atualiza dados de um exercicio}
*/
ExerciseDAO.prototype.update = function(_id,data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('exercises');
        // console.log(data);
        collection.updateOne({_id : _id},{$set: data}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar Exercicio!'});
                throw err;
            }

            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'Exercicio alterado com sucesso!'});
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
* @returns {deleta um exercicio}
*/
ExerciseDAO.prototype.delete = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('exercises');

        collection.remove({_id : _id},function(err, obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao deletar exercício!'});
                throw err;
            }

            // console.log(obj.result);
            if(obj.result.n != 0){
                res.send({'success': true, 'msg' : ' Exercício deletado!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Exercício não cadastrado, impossível deletar!'});
            }
        });

        client.close();
    });
}


module.exports = function(){
	return ExerciseDAO;
}