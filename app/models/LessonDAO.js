var request = require('request');

function LessonDAO(conn){
    this._connection = conn;
}

/**
* Popula o banco de dados buscando da API
* @author Iago Nuvem
*/
LessonDAO.prototype.fillLessons = function(data,res){

}

/**
* @author Iago Nuvem
* @returns 
*/
LessonDAO.prototype.addIssue = function(data,res){
    
}


/**
* @author Iago Nuvem
* @returns {Dados das lições}
*/
LessonDAO.prototype.getAllByClass = function(data,res){
    request.post({
        url: options.url,
        headers: options.headers,
        body: {
            "student_id" : e.student_id,
            "class_id": e.class_id,
            "situation": e.situation
        },
        json: true
        },function(error, response, body){
           res.send(body);
        })
}


module.exports = function(){
	return LessonDAO;
}