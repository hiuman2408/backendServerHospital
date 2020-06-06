//REQUIRES 
var express = require('express');


var mongoose = require('mongoose');

//INICIALIZAR VARIABLE

const app = express();

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


//RUTAS (RESIVE COLLBACK)

app.get('/', (req, res,next) => {
   
    res.status(200).json({
        ok:true,
        mensaje:'Peticion relizada correctamente status200'
    })
    
});


// ESCUHCAR PETICIONES

app.listen(3000, () => {
    console.log('el servidor corriendo  en el puerto 3000!');
});

//Run app, then load http://localhost:port in a browser to see the output.

