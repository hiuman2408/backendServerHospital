


var express = require('express')
var fileUpload = require('express-fileupload');

var fs = require('fs'); //para el pathviejo 

var app = express();
// default options
app.use(fileUpload())


//IMPORTAR MODELOS USUARIO MEDICO HOSPITALES

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario')


app.put('/:tipo/:id', (req, res,next) => { // tipo  = medico ,hospital,usuario id= id (medico, usuario hospital)

    var tipo = req.params.tipo;
    var id= req.params.id;



    //VALIDAR TIPOS DE COLLECION 

    var tiposValidos =['hospitales','usuarios','medicos'];

    if(tiposValidos.indexOf(tipo)<0){
       return  res.status(400).json({
            ok:false,
            mensaje:'Tipo de collecion no es valida',
            errors:{messagge:'Las collecion validas son: '+tiposValidos.join(', ')}
        })

    }


    

    //VALIDACION SI VIENE UN TIPO DE RCHIVO FILE
    if(!req.files){

       return  res.status(400).json({
            ok:false,
            mensaje:'no se encontro nada',
            errors:{messagge:'debe selecionar una imagen'}
        })

    }


    //OBTNER ARCHIVO
     var File= req.files.imagen;

    //obtner datos del archivo
     var archivo ={
        "nombre":File.name,
        "tamaño":File.size,
        //"tipoImagen":File.mimetype,
        "tipo":tipo,
        "id":id
    }

   //PRIMERA FORMA DE VALIDAD IMAGENES
    var nombreCortado = archivo.nombre.split('.');
    var  extensionArchivo = nombreCortado[nombreCortado.length-1];
    var extensionesValidas =['png','jpg','jpeg','gif'];

    if(extensionesValidas.indexOf(extensionArchivo)<0){

       return res.status(400).json({
            ok:false,
            mensaje:'Extencion no valida',
            errors:{mensaje:'las extensione validas son: '+extensionesValidas.join(', ')}
            
        })
    }

   //NOMBRE DELA RCHIVO PERSONALIZADO idusuario-numerorandon.png
   // var nombreArchivo = `${id}-${archivo.nombre}`

    var nombreArchivo =`${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
     
    archivo.nombreArchivo = nombreArchivo;  //asiganmos al objeto archivo propiedad nombre archivo
    archivo.extensionArchivo=extensionArchivo; //asiganmos al objeto archivo propiedad extension archivo


    //MOVER ARCHVIO TEMPORAL A UN CARPETA 

    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.path = path;


    File.mv(path,err=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        //ACTUALIZAR DATOS DEL MEDICO HOSPITAL O USUARIOS SEGUN EL Id
        subirPorTipo(archivo, res) //RES SE PASA PARA RETURN SE DE EN LA FUNCION
      /* return  res.status(200).json({
            ok:true,
            imagen:archivo,
    
            mensaje:"Archivo movido"
        });*/

    });
    

    

   


   //SEGUNDA FORMA DE VALIDAR UNA IMGEN 
    /*if(archivo.tipoImagen=='image/png' || archivo.tipoImagen=='image/jpg' || archivo.tipoImagen=='image/jpeg' || archivo.tipoImagen=='image/gif'){
        res.status(200).json({
            ok:true,
            File:archivo,
            nombreCortado:nombreCortado,
            extensionArchivo:extensionArchivo,
            mensaje:"Todo ok"
        })
        
    }else{
        res.status(400).json({
            ok:false,
            mensaje:'Error en el tipo de archivo solo se admite jpg,png y jpeg',
            
        })
        
    }*/

   
   
});


//FUNCIONNES PARA ACTUALIZAR DATOS DE LA IMGEN DEL MEDICO HOSPIAL USUARIO
function subirPorTipo(archivo, res) {

    if(archivo.tipo==='usuarios'){

        Usuario.findById(archivo.id,(err,usuario)=>{ //buscar usuarios por Id (empleando el modelo usuarios)

            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje:'el Usuario con ese ID no existe ',
                    errors:{messagge:'No existe el Usuario'}
                }) 
            }
            if(!usuario){
                return res.status(400).json({
                    ok:false,
                    mensaje:'El usuario  con el '+id+ 'no existe',
                    errors:{mesagge:'No existe un usuario con este Id'}
                }) 
            }

            var pathAntiguo = './uploads/usuarios/'+ usuario.image;
             // Si existe, elimina la imagen anterior
             if (fs.existsSync(pathAntiguo)) {
                fs.unlinkSync(pathAntiguo);
            }

            usuario.image = archivo.nombreArchivo;
            usuario.save((err,usuarioActualizado)=>{

                if(err){
                    return res.status(400).json({
                        ok:false,
                        mensaje:'Error al Actualizar usuario ',
                        errors:err
                    })
                }

                usuarioActualizado.password=':)';

                return res.status(200).json({
                    ok: true,
                    imagen:archivo,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                });

            })

        })

    }


    if(archivo.tipo==='medicos'){ 

        Medico.findById(archivo.id,(err,medico)=>{ //buscar medico por Id (empleando el modelo medico)

            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje:'el Medico con ese ID no existe ',
                    errors:{messagge:'No existe el Medico'}
                }) 
            }

            if(!medico){
                return res.status(400).json({
                    ok:false,
                    mensaje:'El medico  con el '+id+ 'no existe',
                    errors:{mesagge:'No existe un medico con este Id'}
                }) 
            }

            var pathAntiguo = './uploads/medicos/'+ medico.image;
             // Si existe, elimina la imagen anterior
             if (fs.existsSync(pathAntiguo)) {
                 fs.unlinkSync(pathAntiguo)
            }

            medico.image = archivo.nombreArchivo;

            medico.save((err,medicoActualizado)=>{

                if(err){
                    return res.status(400).json({
                        ok:false,
                        mensaje:'Error al Actualizar medico ',
                        errors:err
                    })
    
                }
                return res.status(200).json({
                    ok: true,
                    imagen:archivo,
                    mensaje: 'Imagen de Medico actualizada',
                    medicoActualizado: medicoActualizado
                });


            })

        })



    }

    if(archivo.tipo==='hospitales'){

        Hospital.findById(archivo.id,(err,hospital)=>{ //buscar hospital por Id (empleando el modelo Hospital)

            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje:'el hospital con ese ID no existe ',
                    errors:{messagge:'No existe el hospital'}
                }) 
            }

            if(!hospital){
                return res.status(400).json({
                    ok:false,
                    mensaje:'El hospital  con el '+id+ 'no existe',
                    errors:{mesagge:'No existe un hospital con este Id'}
                }) 
            }

            var pathAntiguo = './uploads/hospitales/'+ hospital.image;
             // Si existe, elimina la imagen anterior
             if (fs.existsSync(pathAntiguo)) {
                 fs.unlinkSync(pathAntiguo)
            }

            hospital.image = archivo.nombreArchivo;

            hospital.save((err,hospitalActualizado)=>{

                if(err){
                    return res.status(400).json({
                        ok:false,
                        mensaje:'Error al Actualizar hospital ',
                        errors:err
                    })
    
                }

                return res.status(200).json({
                    ok: true,
                    imagen:archivo,
                    mensaje: 'Imagen de Hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });


            })

        })

    }



}

//VALIDAR ID ANTES DE SUBIR LA IMAGEN AL SERVIDOR









module.exports = app;