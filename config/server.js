// Incluindo os módulos da aplicação
var express = require('express');
const { check, validationResult } = require('express-validator');
var consign = require('consign');
var bodyParser = require('body-parser');
var cors = require('cors');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
// var del = require('del');

// Inicializa o express
var app = express();

app.set('view engine' , 'ejs');
app.set('views', './app/views');


// Midlewares
app.use(express.static('./app/public'));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// app.use(bodyParser.urlencoded({extended: true}));
//app.use(expressValidator());
const corsOptions = {
      origin: '*'
      // credentials: true
    }
app.use(cors(corsOptions));
// app.use(multer({ storage }).single('file'));
app.options('*', cors());

//Upload de IMG
// cria uma instância do middleware configurada
// destination: lida com o destino
// filenane: permite definir o nome do arquivo gravado
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // error first callback
        cb(null, './app/public/uploads/');
    },
    filename: function (req, file, cb) {

        // error first callback
        cb(null, `${file.fieldname}-${Date.now()}.${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage : storage });

app.post('/uploadFile', upload.single('file'), (req, res) => {
	// console.log(req.body,req.file);
	res.send({'success' : 1, 'msg' : 'Upload realizado com sucesso!', 'file' : req.file})
}); 


//AutoLoads 
consign()
    .include('app/routes')
    .then('app/models')
    .then('app/controllers')
    .then('app/customs')
    .then('config/dbConnection.js')
    .then('config/apiConfig.js')
    .into(app);

module.exports = app;
