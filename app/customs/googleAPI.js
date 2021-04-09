const {google} = require('googleapis');
// const calendar = google.calendar('v3');

const axios = require('axios');

function googleAPI(redirectUrl, params){
    this.config = {
        'API_KEY' : 'API_KEY_TESTE',
        'CLIENT_SECRET': 'G1tIqEgfT-f7yahcfFSJhDeD',
        'CLIENT_ID': '7871070123-o1h8g657po62jl2mk4qf5iomdgc38bbl.apps.googleusercontent.com',
        'REDIRECT_URL': redirectUrl
    }

    // Recursos da API Google
    this.scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
    ];

    this.oauth2Client = new google.auth.OAuth2(
        this.config['CLIENT_ID'],
        this.config['CLIENT_SECRET'],
        this.config['REDIRECT_URL']
    );

    this.params = params;
}

googleAPI.prototype.getOAuthUrl = async function(){
    const buff = Buffer.from(JSON.stringify(this.params));
    // Autentica no Oauth2 para utilizar a API
    const url = this.oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        // access_type: 'offline',
        scope: this.scopes,
        state: buff.toString('base64')
    });

    return url;
}

googleAPI.prototype.getCredentials = async function(code){
    const {tokens} = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    
    return this.oauth2Client;
}

googleAPI.prototype.setCalendarEvent = async function(data){
    this.oauth2Client.setCredentials(data.credentials);
    let event = {
        'summary': data.event.summary,
        'description': data.event.description,
        'start': {
            'dateTime': data.event.start.dateTime,
            'timeZone': 'America/Sao_Paulo',
        },
        'end': {
            'dateTime': data.event.end.dateTime,
            'timeZone': 'America/Sao_Paulo',
        },
        'attendees': [{'email': data.attendee}],
        
    }
    let auth = this.oauth2Client;
    const calendar = google.calendar({version: 'v3', auth});
    const insertObj = await calendar.events.insert({
        sendUpdates: "all",
        auth: auth,
        calendarId: data.calendarId,
        resource: event
    });
    if(insertObj.status == 200){
        // console.log(insertObj);
        return({success: true, msg: "Evento criado com sucesso!", data: insertObj.data});
    }else{
        return({success: false, msg: "Falha ao agendar evento!"});
    }
    // calendar.events.insert({
    //     auth: auth,
    //     calendarId: data.calendarId,
    //     resource: event,
    //   }, function(err, event) {
    //       console.log('Google API callback');
    //     if (err) {
    //         console.log('There was an error contacting the Calendar service: ' + err);
    //         return({success: false, msg: "Falha ao agendar evento!"});
    //     }
    //     return({success: true, msg: "Evento criado com sucesso!", data: event});
    // });
}

googleAPI.prototype.removeCalendarEvent = async function(data){
    this.oauth2Client.setCredentials(data.credentials);

    let auth = this.oauth2Client;
    const calendar = google.calendar({version: 'v3', auth});
    const deleteObj = await calendar.events.delete({
        calendarId: data.calendarId,
        eventId: data.eventId,
        sendUpdates: 'all'
    })
    
    // console.log(deleteObj);
    if(deleteObj.status == 200 || deleteObj.status == 204){
        return({success: true, msg: "Deletado com sucesso!"});
    }else{
        return({success: false, msg: "Falha ao deletar evento!"});
    }
}

googleAPI.prototype.getCalendarEventDetail = async function(data){
    this.oauth2Client.setCredentials(data.credentials);
    let auth = this.oauth2Client;
    const calendar = google.calendar({version: 'v3', auth});
    const eventObj = await calendar.events.get({
        calendarId: data.calendarId,
        eventId: data.eventId,
        auth: auth
    })

    if(eventObj.status == 200){
        return({success: true, msg: "Dados obtidos com sucesso!", data: eventObj.data});
    }else{
        return({success: false, msg: "Falha ao obter dados do evento!"});
    }
}

module.exports = function(){
    return googleAPI;
}