function webSocket(server){
    this._server = server;
    this._app = require('http').createServer(server);
    this._io = require('socket.io').listen(this._app);
    
    this._io.origins(['*:*']);
    
    // Variavéis globais
    // this._server.set('io', this._io);
}

/**
* Inicia express e websocket na mesma porta
*/
webSocket.prototype.listen = function(port) {
    this._app.listen(port, function(){
      console.log('Servidor Online na porta:'+port);
    });
    // Inicia Websocket
    this.init();
}

webSocket.prototype.init = function() {
    this._io.on('connection' , function(socket){
        var _name = undefined;
        //console.log("Usuário Conectou!");
        socket.on('disconnect', function(){
            // Emite para todos usuários do websocket
            socket.broadcast.emit('msgUserOut', {
                name: _name,
                msg : 'acabou de sair do chat!'
            });

            // console.log("Usuário Desconectou!");
        })

        socket.on('globalNotification', function(data){
            // console.log('GLOBAL NOTIFICATION:')
            // console.log(data);
            if(data['news'] == true){
                socket.broadcast.emit('newNotification', {
                    'title': 'Há uma nova novidade!',
                    'description': 'Confira os detalhes no Seed News',
                    'api_key': data['api_key']
                });
            }else{
                socket.broadcast.emit('newNotification', data);
            }
            
        })

        //Preenche dados locais
        socket.on('fillData', function(data){
            _name = data.name;
        });

        // Recebendo do Websocket
        socket.on('sendMsg', function(data){
            _name = data.name;
            // Emite a função apenas para o Usuário atual da requisição
            socket.emit('msgUserIn', {
                class_id: data.class_id,
                name: data.name,
                msg : data.msg,
                createdAt: new Date()
            });

            // Emite para todos usuários do websocket
            socket.broadcast.emit('msgUserIn', {
                class_id: data.class_id,
                name: data.name,
                msg : data.msg,
                createdAt: new Date()
            });

            if(parseInt(data.insertedUser) == 0){
                socket.emit('refreshUsers', {
                    name: data.name
                });
        
                socket.broadcast.emit('refreshUsers', {
                    name: data.name
                });
            }
            
        })
        
        socket.on('userTyping', function(data){
            socket.broadcast.emit('userTyping', {
                name: data.name
            });
        })

        socket.on('userNotTyping', function(data){
            socket.broadcast.emit('userNotTyping', {});
        })

    })  
};


module.exports = function(){
    return webSocket;
}