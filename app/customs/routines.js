let request = require('request');
const UserDAO = require('../models/UserDAO');
function routines(application){
    this._connection = new application.config.dbConnection();
    this._UserDAO = new application.app.models.UserDAO(this._connection);
    
    this.gCalAPIKey = 'AIzaSyAIqBVKFOej2lnR6idfPu9paPnPphhtZgI'; 
    this.calendars = {
        'JM': 'd1m5jhjatlfo0rgkibj97gfkb0@group.calendar.google.com',
        'contagem': 'cjid1l2o6clun96tib13b89qsk@group.calendar.google.com',
        'caratinga': 'flkdtut40es76k3lgl5ca8anao@group.calendar.google.com'
    }
    this.TUTORING_CREDITS = 12;
}

routines.prototype.checkGoogleCalendar = async function(){
    let users = await this._UserDAO.getAll();
    for(let user of users){
        if(user['tutoring']){
            for(let i in user['tutoring']['schedule']){
                const options = {
                    url: 'https://www.googleapis.com/calendar/v3/calendars/'+await this.getCalendarByAPIKey(user['api_key'])+'/events/'+user['tutoring']['schedule'][i]+'?key='+this.gCalAPIKey,
                    headers: {}
                }
                let eventDetail = await new Promise(function(resolve,reject){
                    request.get(options, function(error, response, body) {
                        if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
                            resolve(body)
                        }
                        else{
                            reject(error);
                        }
                    });
                })
                eventDetail = JSON.parse(eventDetail);
                // Caso evento tenha sido cancelado pelo google....
                if(eventDetail['status'] == 'cancelled'){
                    // Remove do array
                    user['tutoring']['schedule'].splice(i, 1);
                    // Devolve o crédito do usuário
                    user['tutoring']['credits'] = parseInt(user['tutoring']['credits']) + 1;
                    
                    // Salva dados do usuário
                    let updateUser = await this._UserDAO.updateAsync(user['_id'],{tutoring: user['tutoring']});
                    if(!updateUser){
                        console.log('Falha ao atualizar tutoring de '+user['name']);
                    }
                }
            }
        }
    }
}

routines.prototype.getCalendarByAPIKey = async function(apikey){
    if(apikey == '0935C4'){ // João Monlevade
        return this.calendars['JM'];
    }
    if(apikey == '3264F7'){ // Contagem
        return this.calendars['contagem'];
    }
    if(apikey == '068EE5'){ // Caratinga
        return this.calendars['caratinga'];
    }
}

module.exports = function(){
    return routines;
}