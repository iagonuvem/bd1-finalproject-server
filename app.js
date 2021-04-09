// Importando configurações do servidor
var app = require('./config/server');
const ws = new app.app.customs.websocket(app);

const _15_MINUTES = 900000;
const _1_HOUR = 3600000;

// Parametrizar a porta de escuta
ws.listen(3000);

var usersFill = new app.app.customs.usersFill(app);
var routines = new app.app.customs.routines(app);

setInterval(function(){
    // console.log('EXECUTOU USERS FILL');
    usersFill.fillStudents();
    usersFill.fillTeachers();
}, _15_MINUTES);

setInterval(function(){
    routines.checkGoogleCalendar();
}, _1_HOUR);