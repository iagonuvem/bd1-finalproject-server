var request = require('request');

function NotificationDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
*/
NotificationDAO.prototype.new = function (data, res) {
    var mongoConnected = this._connection.connectToMongo(function (client, db) {
        const collection = db.collection('notifications');

        collection.insertOne(data, function (err, obj) {
            if (err) {
                res.send({ 'success': false, 'msg': 'Falha ao inserir notificação!' });
                throw err;
            }

            res.send({ 'success': true, 'msg': 'Notificação Cadastrada com sucesso!' });
        });
    })
}


/**
* @author Iago Nuvem
*/
NotificationDAO.prototype.delete = function(data,res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('notifications');

        collection.deleteOne({_id : data._id},function(err, obj){
            if(err){
                res.send({'success': false, 'msg' : 'Falha ao deletar notificação!'});
                throw err;
            }

            // console.log(obj.result);
            if(obj.result.n != 0){
                res.send({'success': true, 'msg' : 'Notificação deletada!'});
            }
            else{
                res.send({'success': false, 'msg' : 'Notificação não cadastrada, impossível deletar!'});
            }
        });

        client.close();
    });
}


/**
* @author Iago Nuvem
* @returns {Notificações por unidade}
*/
NotificationDAO.prototype.getByUnit = function(data,res){
    var conn = this._connection;
	var mongoConnected = this._connection.connectToMongo(function(client, db){
	    const collection = db.collection('notifications');

	    collection.find({'api_key' : data.api_key}).toArray(function(err, result){
	        if(err){
                res.send({'ok': 0, 'msg': 'Erro ao buscar dados'});
                return;
	        }
            res.send(result);	   
            client.close();     
	    });
	});
}

module.exports = function(){
	return NotificationDAO;
}