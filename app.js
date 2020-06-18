//REQUIRES 
var express = require('express');
var mongoose = require('mongoose');

var bodyParser = require('body-parser')

//INICIALIZAR VARIABLE

const app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


//importar rutas

var appRoutes = require('./routes/app')
var usuarioRoutes = require('./routes/usuario')
var loginRoutes = require('./routes/login')
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//CONEXION A LA BASE DE DATOS

mongoose.connect('mongodb://localhost:27017/hospitalDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(db => console.log('Database is connected '))
    .catch(err => console.log(err));


/*mongoose.connect('mongodb://localhost:27017/hospitalDB', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    console.log("base de datos online")
  // we're connected!
});
*/


//BODY-PARSER

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



//RUTAS (RESIVE COLLBACK) midelwer

app.use('/usuario',usuarioRoutes)
app.use('/login',loginRoutes)
app.use('/hospital',hospitalRoutes)
app.use('/medico',medicoRoutes)
app.use('/busqueda',busquedaRoutes)
app.use('/upload',uploadRoutes)
app.use('/imagen',imagenesRoutes)
app.use('/',appRoutes)

// ESCUHCAR PETICIONES

app.listen(3000, () => {
    console.log('el servidor corriendo  en el puerto ll 3000!');
});

//Run app, then load http://localhost:port in a browser to see the output.

//https://documenter.getpostman.com/view/11693125/SzzehfgQ?version=latest  documentacion postman