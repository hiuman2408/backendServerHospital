var express = require('express')

//importar para encryptar 
var bcrypt = require('bcryptjs');

//import libreria jsonWebTroken
var jwt = require('jsonwebtoken');


//importar las configuraciones
var SEED = require('../config/config').SEED;

//GOOGLE


var CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


var app = express();

//importar el modelo de usuario

var Usuario = require('../models/usuario')


//AUTENTICACION GOOGLE


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
   // const userid = payload['sub'];
    
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        image: payload.picture,
        google: true,
        //payload
    }
  }
  //verify().catch(console.error);


  app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });


   Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }

        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.image = googleUser.image;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            });

        }


    });




   /* return res.status(200).json({
        ok: true,
       mensaje: 'OK!!!',
       googleUser: googleUser
     });*/


});



//AUTENTICACION NORMAL

app.post('/',(req,res)=>{

    var body = req.body;

    Usuario.findOne({email:body.email},(err,usuarioDB)=>{

      if(err){
          return res.status(500).json({
              ok:false,
              mensaje:'Error al buscar usuario',
              errors:err

          });
      }

      if(!usuarioDB){
        return res.status(400).json({
            ok:false,
            mensaje:'Credencial inocrectas -email',
            errors:err

        });

      }

      if(!bcrypt.compareSync(body.password,usuarioDB.password)){

        return res.status(400).json({
            ok:false,
            mensaje:'Credencial inocrectas -password',
            errors:err

        });
      }

      usuarioDB.password =':)'

      //crear un tokern

      var token = jwt.sign({usuario:usuarioDB},SEED,{expiresIn:14400}) //expira en 4 horas


        res.status(200).json({
            ok:true,
            usuario:usuarioDB,
            token:token,
            id:usuarioDB._id
            
        });

    });
   
})



module.exports = app;