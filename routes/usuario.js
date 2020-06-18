var express = require('express')

//importa r l jwtoken


//importa vewrifiacion token

var mdlAutenticacion = require('../middlewares/autenticacion');

//importar para encryptar 

var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);



var app = express();

//importar el modelo de usuario

var Usuario = require('../models/usuario')


//LISTAR USUARIOS 

app.get('/', (req, res,next) => {

    var desde = req.query.desde || 0; //parametro opcional por la URl
        desde = Number(desde);


    Usuario.find({},'nombre email image role google')
          .skip(desde)  //desde que indice 
          .limit(5)   //cuantos registros a mostrar
           .exec(
                (err,usuarios)=>{

                if(err){
                    return res.status(500).json({
                        ok:false,
                        mensaje:'Error cargando usuario (Base de datos)',
                        errors:err
                    }) 
            }

            Usuario.count({}, (err, totalUsuarios) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: totalUsuarios
                    });
            })


        
        
        
    })
   
    
});






//ACTUALIZAR USUARIO 

app.put('/:id',mdlAutenticacion.verificaToken,(req,res)=>{ 

    var id= req.params.id;
    var body = req.body;
    Usuario.findById(id,(err,usuario1)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al Buscar usuario ',
                errors:err
            }) 
        }
        if(!usuario1){
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario  con el '+id+ 'no existe',
                errors:{mesagge:'No existe un usuario con este Id'}
            }) 
        }
        usuario1.nombre = body.nombre;
        usuario1.email = body.email;
        usuario1.role = body.role;

        usuario1.save((err,usuarioGuardado)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al Actualizar usuario ',
                    errors:err
                })

            }

            usuarioGuardado.password =';)'
            
           res.status(200).json({
                ok:true,
                usuario:usuarioGuardado
            })
        })



    })

 

})


//CREAR USUARIO

app.post('/',(req,res)=>{ //NO SE UTLIZA VERIFIACION DE TOKEN ,mdlAutenticacion.verificaToken,

    var body = req.body;

    var usuario = new Usuario({
        nombre:body.nombre,
        email:body.email,
        password: bcrypt.hashSync(body.password,salt),
        image:body.image,
        role:body.role
    });

    usuario.save((err,usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                mensaje:'Error al crear  usuario ',
                errors:err
            }) 
        }
 
        res.status(201).json({
            ok:true,
            usuario:usuarioGuardado,
            usuariotoken: req.usuario
        })

    })

})




//ELIMINAR USUARIO
app.delete('/:id',mdlAutenticacion.verificaToken,(req,res)=>{
    
    var id= req.params.id;
    Usuario.findByIdAndRemove(id,(err,usuarioBorrado)=>{

        
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al Borrar usuario ',
                errors:err
            })

        } 
        if(!usuarioBorrado){
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario  con el Id: '+id+ '  no existe',
                errors:{mesagge:'No existe un usuario con este Id'}
            }) 
        }


        
        res.status(200).json({
            ok:true,
            usuario:usuarioBorrado
        })



    })

})




module.exports = app;


