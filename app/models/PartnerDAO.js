var request = require('request');

function PartnerDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Todos os parceiros}
*/
PartnerDAO.prototype.getAll = function(res){
    var mongoConnected = this._connection.connectToMongo(function(client, db){
        const collection = db.collection('partners');

        collection.find().sort({"name":1}).toArray(function(err, result){
            // console.log(result);
            res.send(result);  
        });

        client.close();
    });
}


module.exports = function(){
	return PartnerDAO;
}