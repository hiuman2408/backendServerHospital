var express = require('express')

//importar para encryptar 
var bcrypt = require('bcryptjs');

//import libreria jsonWebTroken
var jwt = require('jsonwebtoken');


//importar las configuraciones
var SEED = require('../config/config').SEED;

var app = express();

//importar el modelo de usuario

var Usuario = require('../models/usuario')

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
            usuarioLogin:usuarioDB,
            tokenUser:token,
            id:usuarioDB._id
            
        });

    });
   
})



module.exports = app;