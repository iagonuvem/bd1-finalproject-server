var request = require('request');

function FinancialDAO(conn){
    this._connection = conn;
}

/**
* @author Iago Nuvem
* @returns {Dados financeiros do aluno}
*/
FinancialDAO.prototype.getAll = function(data,res){
    
}


module.exports = function(){
	return FinancialDAO;
}