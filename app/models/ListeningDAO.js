var request = require('request');

function ListeningDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Todos os albuns de listening}
*/
ListeningDAO.prototype.getAll = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('listening');

        collection.find().sort({"name":1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}


module.exports = function(){
	return ListeningDAO;
}