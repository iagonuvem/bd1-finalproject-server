let request = require('request');
const { promises } = require('fs');
function usersFill(application){
    this._api_keys = [
    '3264F7',
    '0935C4',
    '068EE5'
    ];
    this._connection = new application.config.dbConnection();
 	this._UserDAO = new application.app.models.UserDAO(this._connection);
    this._apiConfig = function(api_key){
    	return new application.config.apiConfig(api_key);
    }

    // Constantes
    this.TUTORING_CREDITS = 12;
}

usersFill.prototype.fillTeachers = async function(){
    for(var i in this._api_keys){
        async function asyncForEach(array, callback) {
          for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
          }
        }
        const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

        let connection = this._connection;
        let apiConfig = this._apiConfig(this._api_keys[i]);
        let UserDAO = this._UserDAO;
        let options = {
              url: apiConfig._url+'/employees',
              headers: {
                'api_key': apiConfig._apiKey
              }
            };
        
        let optionsClass = {
            url: apiConfig._url+'/classes',
            headers: {
                'api_key': apiConfig._apiKey
            }
        };

        let employees;
        try {
            employees = await new Promise((resolve, reject) => {
                try {
                    request.get(options, function(error, response, body) {
                        if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
                            resolve(body);
                        }
                        else{
                            reject(error);
                        }
                    });
                } catch (error) {
                    reject(error);
                }    
            });
        } catch (error) {
            console.log(error);
        }
        
        let classes;
        try {
            classes = await new Promise((resolve, reject) => {
                try {
                    request.get(optionsClass, function(error, response, body) {
                        if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
                            resolve(body);
                        }
                        else{
                            reject(error);
                        }
                    });
                } catch (error) {
                    reject(error);
                }    
            });
            classes = JSON.parse(classes);
        } catch (error) {
            console.log(error);
        }
        
        let classesFull = [];

        if (classes) {
            //BUSCA DETALHES DA TURMA
            for (let c of classes) {
                try {
                    var classDetail = await new Promise((resolve, reject) => {
                        try {
                            request.post({
                                url: optionsClass.url,
                                headers: optionsClass.headers,
                                body: { "class_id": c.class_id },
                                json: true
                            }, function (error, response, body) {
                                // console.log(body);
                                if (error) {
                                    reject(error);
                                }
                                resolve(body);
                            });
                        } catch (error) {
                            reject(error);
                        }
                    });
                    // console.log(classDetail);
                    classesFull.push({
                        "class_id": classDetail.class_id,
                        "name": classDetail.name,
                        "professor_id": classDetail.professor_id
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }
        

        // console.log(classesFull);
        employees = JSON.parse(employees);
        let teachers = [];

        // BUSCA DETALHES PROFESSORES
        for(let employee of employees){
            // console.log(employee);
            await waitFor(50);
            try {
                var employeDetail = await new Promise((resolve, reject) => {
                    try {
                        request.post({
                            url: options.url,
                            headers: options.headers,
                            body: { "employee_id": employee.employee_id },
                            json: true
                        }, function (error, response, body) {
                            // console.log(body);
                            if(error){
                                reject(error);
                            }
                            resolve(body);
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
                 // console.log(employeDetail);
                if(employeDetail.teacher){
                    employeDetail.id = employee.employee_id;
                    teachers.push(employeDetail);
                }
            } catch (error) {
                console.log(error);
            }
        }

        
        for(let teacher of teachers){
            var date = new Date(teacher.birthdate);
            var password = '' + (date.getDate()) + (date.getMonth() + 1) + date.getFullYear();
            password = require('./encrypt').md5(password);
            teacher.access_type = 3;
            teacher.api_key = options.headers.api_key; 
            teacher.password = password;
            teacher.registrations = [];
            // Preenche turmas do professor
            for(let c of classesFull){
                if(c.professor_id == teacher.id){
                    teacher.registrations.push({
                        'class_id': c.class_id,
                        'name': c.name
                    });
                }
            }
        }

        UserDAO.fillUsers(teachers);
        // console.log(teachers);
    }
}

usersFill.prototype.fillStudents = function(){
	for(var i in this._api_keys){
        async function asyncForEach(array, callback) {
          for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
          }
        }
        const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

        let connection = this._connection;
        let apiConfig = this._apiConfig(this._api_keys[i]);
        let UserDAO = this._UserDAO;
        let TUTORING_CREDITS = this.TUTORING_CREDITS;
        let options = {
              url: apiConfig._url+'/students',
              headers: {
                'api_key': apiConfig._apiKey
              }
            };
        request.get(options, function(error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
                try {
                    var arr = JSON.parse(body);
                    var fill = [];

                    new Promise(function (resolve, reject) {
                        for (var i in arr) {
                            if (arr[i].situation.situation_id == -1) {
                                fill.push(arr[i]);
                            }
                        }
                        resolve(fill);
                    })
                    .then(function (users) {
                            const fullData = async () => {
                                var fill = [];
                                await asyncForEach(users, async (e) => {
                                    await waitFor(50);
                                    await request.post({
                                        url: options.url,
                                        headers: options.headers,
                                        body: { "student_id": e.student_id },
                                        json: true
                                    }, function (error, response, body) {
                                        // console.log(options.headers.api_key + ' - ' + body[0].city);
                                        if (body) {
                                            if (!(body[0].response != null)) {
                                                var date = new Date(body[0].birthdate);
                                                var password = '' + (date.getDate()) + (date.getMonth() + 1) + date.getFullYear();
                                                password = require('./encrypt').md5(password);
                                                body[0].access_type = 4;
                                                body[0].api_key = options.headers.api_key; 
                                                body[0].password = password;
                                                body[0].tutoring = {
                                                    'credits': TUTORING_CREDITS,
                                                    'schedule': []
                                                }
                                                fill.push(body[0]);
                                            }
                                        }
                                    })
                                })
                                if (fill != []) {
                                    UserDAO.fillUsers(fill); 
                                }
                            }
                            fullData();
                    })
                    .catch(function (err) {
                        console.log(err);
                        return;
                        // throw err;
                    })
                } catch (error) {
                    console.log(error);
                    return;
                    // throw error;
                }
            }
            else{
                console.log(error);
                return;
                // throw error;
            }
        });
    }
}

module.exports = function(){
    return usersFill;
}