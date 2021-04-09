var request = require('request');

function NewsDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Todos os noticias com a data superior à data atual}
*/
NewsDAO.prototype.getAll = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('news');

        collection.find().sort({"date": -1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {Dados de uma noticia}
*/
NewsDAO.prototype.getById = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('news');

        collection.findOne({"_id" : _id}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {Noticias por unidade}
*/
NewsDAO.prototype.getAllByUnit = function(api_key,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('news');

        collection.find({"api_key" : api_key}).sort({"date": -1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}

/**
* @author Iago Nuvem
* @returns {atualiza dados de um noticia}
*/
NewsDAO.prototype.insert = function(data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
		    const collection = db.collection('news');

		    collection.insertOne(data, function(err,response){
	            if(err){
	            	res.send({'success': false, 'msg' : 'Falha ao inserir Notícia!'});
		            throw err;
		        }
	            res.send({'success': true, 'msg' : 'Notícia inserida com sucesso!'});
	        });

		    client.close();
		});	
}

/**
* @author Iago Nuvem
* @returns {atualiza dados de um noticia}
*/
NewsDAO.prototype.update = function(_id,data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('news');
        // console.log(data);
        collection.updateOne({_id : _id},{$set: data}, function(err,obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao alterar Notícia!'});
                throw err;
            }

            if(obj.result.nModified > 0){
                res.send({'success': true, 'msg' : 'Notícia alterada com sucesso!'});
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
* @returns {deleta um noticia}
*/
NewsDAO.prototype.delete = function(_id,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('news');

        collection.remove({_id : _id},function(err, obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao deletar noticia!'});
                throw err;
            }

            // console.log(obj.result);
            if(obj.result.n != 0){
                res.send({'success': true, 'msg' : ' Notícia deletada!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Notícia não cadastrada, impossível deletar!'});
            }
        });

        client.close();
    });
}


module.exports = function(){
	return NewsDAO;
}