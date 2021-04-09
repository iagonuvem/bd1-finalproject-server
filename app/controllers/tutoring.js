const { listenerCount } = require('../../config/server');
const UserDAO = require('../models/UserDAO');

var ObjectID = require('mongodb').ObjectID;

const ANDROID_DEEPLINK = '';
const IOS_DEEPLINK = '';
const BASE_LINK = 'http://localhost:3000'

// Limite de tempo minimo de antecedencia para reemboolso (DEFINIR COM BASE NAS REGRAS DE NEGÓCIO)
const CANCEL_TIME_LIMIT = 3600000; // 1 HORA

// Tempo mínimo de antecedência para agendamento de aula
const SCHEDULE_MIN_TIME = 3600000; // 12 HORAS
/**
 * Retorna url de autenticação OAuth2 do Google
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getOAuthUrl = async function(application, req, res){
    var id = req.body._id;
    if(!id){
        res.send({success: false, msg: 'Missing user_id'});
        return;
    }
	var googleAPI = new application.app.customs.googleAPI(BASE_LINK+'/tutoring/getCredentials', {'_id': id});
    try {
        const url = await googleAPI.getOAuthUrl();
        res.send({success: true, url: url});
    } catch (error) {
        res.send({success: false, msg: error});
    }    
}

/**
 * Retorna dados de usuario google autenticado e salva no BD
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getCredentials = async function (application, req, res) {
    let state = JSON.parse(Buffer.from(req.query.state, 'base64'));
    const code = decodeURIComponent(req.query.code);
    var googleAPI = new application.app.customs.googleAPI(BASE_LINK+'/tutoring/getCredentials' , {});

    if(!code){
        res.send({success: false, msg: 'Missing code'});
        return;
    }

    if(!state['_id']){
        res.send({success: false, msg: 'Missing User Id'});
        return;
    }

    try {
        const user = await googleAPI.getCredentials(code);
        if(user['credentials']){

            var connection = new application.config.dbConnection();
            let UserDAO = new application.app.models.UserDAO(connection);

            let update = await UserDAO.updateAsync(ObjectID(state['_id']),
                {'googleApiCredentials': user['credentials']});

            if(update){
                res.send({success: true, msg: "Credenciais atualizadas com sucesso!"});
                return;
            }else{
                res.send({success: false, msg: "Falha ao atualizar credenciais!"});
                return;
            }
            
        }
    } catch (error) {
        // console.log(error);
        res.send({success: false, msg: error.message});
    }   
}

/**
 * Adiciona um evento ao calendario
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.setEvent = async function (application, req, res) {
    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);

    let userId = req.body._id;
    if(!userId){
        res.send({success: false, msg: 'Não é possível agendar sem o usuário!'});
        return;
    }else{
        userId = ObjectID(userId);
    }
    let userData = await UserDAO.getByIdAsync(userId, res);
    if(userData['ok'] != 1){
        res.send({success: false, msg: 'Falha ao buscar dados do usuário!'});
        return;
    }else{
        userData = userData.data;
    }

    let tutoring = req.body.tutoring;
    if(!tutoring){
        res.send({success: false, msg: 'Não é possível agendar referência de agenda!'});
        return;
    }

    if(tutoring['credits'] < 1){
        res.send({success: false, msg: 'Créditos insuficientes para agendar tutoria!'});
        return;
    }

    let credentials = req.body.credentials;
    if(!credentials['access_token'] || !credentials['scope']){
        res.send({success: false, msg: 'Missing Google credentials!'});
        return;
    }
    
    let attendee = req.body.attendee;
    if(!attendee){
        res.send({success: false, msg: 'Não é possível agendar tutoria sem tutor.'});
        return;
    }

    let calendarId = req.body.calendarId;
    if(!calendarId){
        res.send({success: false, msg: 'Não é possível buscar agenda sem referência.'});
        return;
    }

    let event = req.body.event;
    if(!event || !event['summary'] || !event['startTime'] || !event['endTime']){
        res.send({success: false, msg: 'Não é possível agendar sem os dados.', debug: 'Missing event fields'});
        return;
    }

    let now = new Date();
    let eventStart = new Date(event['startTime']);

    // Verificação antecedência agendamento
    if((eventStart.getTime() - now.getTime()) < SCHEDULE_MIN_TIME){
        res.send({success: false, msg: 'Não é possível agendar tutoria com menos de 12 horas de antecedência.'});
        return;
    }

    // Verificação agendamento no mesmo dia
    let userSchedule = userData.tutoring.schedule;
    
    let checkSameDay = await userSchedule.filter(function(obj){
        let dayEvent = eventStart.getDate();
        let daySchedule = new Date(obj.startTime).getDate();
        return dayEvent == daySchedule;
    })
    
    // Caso exista outro agendamento no mesmo dia...
    if(checkSameDay.length > 0){
        res.send({success: false, msg: 'Não é possível agendar mais de uma tutoria no mesmo dia.'});
        return;
    }

    var googleAPI = new application.app.customs.googleAPI(BASE_LINK, {});

    try {
        var data = {
            'event': {
                'summary': event['summary'],
                'description': event['description'],
                'start': {
                    'dateTime': new Date(event['startTime']),
                    'timeZone': 'America/Sao_Paulo',
                },
                'end': {
                    'dateTime': new Date(event['endTime']),
                    'timeZone': 'America/Sao_Paulo',
                }
            },
            'attendee': attendee.email,
            'calendarId': calendarId,
            'credentials': credentials
        }

        // console.log(data)
        const eventObj = await googleAPI.setCalendarEvent(data);
        if(eventObj){
            if(eventObj['success'] != true){
                res.send({success: false, msg: 'Falha ao agendar tutoria!'});
                return;
            } else{
                tutoring['schedule'].push({
                    'eventId': eventObj.data.id,
                    'startTime': eventObj.data.start.dateTime,
                    'tutor': {
                        'name': attendee.name,
                        'email': attendee.email
                    }
                })
                // console.log(eventObj);
                const params = {
                    'tutoring': {
                        'credits': parseInt(tutoring['credits'])-1,
                        'schedule': tutoring['schedule']
                    }
                }
                let update = await UserDAO.updateAsync(
                   userId,
                   params);
                if(update){
                    res.send({success: true, msg: 'Tutoria Adicionada com sucesso!'});
                    return;
                }else{
                    res.send({success: false, msg: 'Falha ao adicionar tutoria!'});
                    return;
                }
            }
            
        }else{
            res.send({success: false, msg: 'Falha ao agendar tutoria!'});
            return;
        }
    } catch (error) {
        console.log(error);
        res.send({success: false, msg: error.message});
    }   
}


/**
 * Remove um evento do calendario
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.removeEvent = async function (application, req, res) {
    var googleAPI = new application.app.customs.googleAPI(BASE_LINK, {});
    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);

    let userId = req.body._id;
    if(!userId){
        res.send({success: false, msg: 'Não é possível remover sem o usuário!'});
        return;
    }
    userId = ObjectID(userId);
    let userData = await UserDAO.getByIdAsync(userId, res);
    if(userData['ok'] != 1){
        res.send({success: false, msg: 'Falha ao buscar dados do usuário!'});
        return;
    }else{
        userData = userData.data;
    }

    let credentials = req.body.credentials;
    if(!credentials['access_token'] || !credentials['scope']){
        res.send({success: false, msg: 'Missing Google credentials!'});
        return;
    }

    let calendarId = req.body.calendarId;
    if(!calendarId){
        res.send({success: false, msg: 'Missing Google Calendar Id!'});
        return;
    }

    let eventId = req.body.eventId;
    if(!eventId){
        res.send({success: false, msg: 'Missing Google event Id!'});
        return;
    }

    let data = {
        'calendarId': calendarId,
        'eventId': eventId,
        'credentials': credentials
    }
    const eventObj = await googleAPI.getCalendarEventDetail(data);
    if(eventObj['success'] == false){
        res.send({success: false, msg: 'Falha ao comunicar com o calendário!'});
        return;
    }

    const now = new Date();
    const eventStart = new Date(eventObj.data.start.dateTime);
    let refund = false;
    if((eventStart.getTime() - now.getTime()) > CANCEL_TIME_LIMIT){
        refund = true;
    }

    // Remove elemento do evento do vetor
    var updateSchedule = userData['tutoring'].schedule.filter( function( elem, index, array ) {
        return elem['eventId'] != eventId;
    });
    try {
        // console.log(data)
        const delObj = await googleAPI.removeCalendarEvent(data);
        if(delObj){
            if(delObj['success'] != true){
                res.send({success: false, msg: 'Falha ao cancelar tutoria!'});
                return;
            } else{
                let credits = parseInt(userData['tutoring'].credits);
                if(refund){
                    credits++;
                }
                // console.log(delObj);
                const params = {
                    'tutoring': {
                        'credits': credits,
                        'schedule': updateSchedule
                    }
                }
                let update = await UserDAO.updateAsync(
                   userId,
                   params);
                if(update){
                    res.send({success: true, msg: 'Tutoria cancelada com sucesso!'});
                    return;
                }else{
                    res.send({success: false, msg: 'Falha ao cancelar tutoria!'});
                    return;
                }
            }
            
        }else{
            res.send({success: false, msg: 'Falha ao cancelar tutoria!'});
            return;
        }
    } catch (error) {
        console.log(error);
        res.send({success: false, msg: error.message});
    }   
}

/**
 * Salva um tutor
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.insertTutor = async function (application, req, res) {
    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);
    try {
        const tutorModel = {
            'api_key': '',
            'name': '',
            'cpf': '',
            'email': '',
            'birthdate':''
        }
    
        const keys = Object.keys(tutorModel);
        for(let key of keys){ // Verifica campos
            if(!req.body[key]){
                res.send({success: false, msg: 'Dados insuficientes para inserir.'});
                return;
            }else{
                tutorModel[key] = req.body[key];
            }
        }
        tutorModel.access_type = 6;

        const result = await UserDAO.insertAsync(tutorModel);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.send(error);
    }   
}

/**
 * Retorna tutores por unidade
 * @param {Instancia do Express} application 
 * @param {Dados da requisição} req 
 * @param {Dados para resposta} res
 * @author Iago Nuvem 
 */
module.exports.getTutorsByUnit = async function (application, req, res) {
    var connection = new application.config.dbConnection();
    let UserDAO = new application.app.models.UserDAO(connection);
    try {
        const params = {
            'api_key': ''
        }
    
        const keys = Object.keys(params);
        for(let key of keys){ // Verifica campos
            if(!req.body[key]){
                res.send({success: false, msg: 'Dados insuficientes para a requisição.'});
                return;
            } else{
                params[key] = req.body[key];
            }
        }

        params.access_type = 6;

        const result = await UserDAO.getByParamsAsync(params);
        if(result.length>0){
            res.send({'success': true, 'data':result});
        }else{
            res.send({'success': false, 'msg': 'Nenhum tutor encontrado para sua unidade!'});
        }
        
    } catch (error) {
        // console.log(error);
        res.send(error);
    }   
}