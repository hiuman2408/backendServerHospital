var express = require('express')
var app = express();


var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario')


//BUSQUEDA EN UNA COLECCION ESPECIFICA

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var desde = req.query.desde || 0; //parametro opcional por la URl
        desde = Number(desde);

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex,desde);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda,regex,desde);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex,desde);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });

    }

    promesa.then(data => {

        res.status(200).json({
            //data:data,
            ok: true,
            [tabla]: data.usuarios, //[tabla ] propiedades de objetos computadas
            total:data.total
        });

    })

});



//BUSQUEDA EN TODAS LAS COLECCIONES
app.get('/todo/:busqueda', (req, res,next) => { //parametro todo/:busqueda

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda,'i')//combertir Busqueda en expresion rtegular (i)=> para INSENSIBLE MAYUSCULAS Y MINISCULAS


    Promise.all([//permite enviar un arreglo de promesas
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ]).then(respuestas=>{

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
    });


    /*buscarHospitales(busqueda,regex).then(hospitalesPromesa=>{
        res.status(200).json({
            ok:true,
            hospitales:hospitalesPromesa
        })
    })

    buscarMedicos(busqueda,regex).then(medicosPromesa=>{
        res.status(200).json({
            ok:true,
            medicos:medicosPromesa
        })
    })

    buscarUsuarios(busqueda,regex).then(usuariosPromesa=>{
        res.status(200).json({
            ok:true,
            usuarios:usuariosPromesa
        })
    })
    */
 

 
});

function buscarHospitales(busqueda,regex,desde){//recibe la busqueda y la expresion regular

    return new Promise((resolve, reject) => {

       

        Hospital.find({nombre:regex},'nombre usuario image')
            .skip(desde)  //desde que indice 
            .limit(5) 
            .populate('usuario', 'nombre email ')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {

                   
                   Hospital.find({nombre:regex}).count({}, (err, totalHospitales) => {

                            resolve({'usuarios':hospitales,'total':totalHospitales})
                     
                    })


                    
                }
            });
    });



}


function buscarMedicos(busqueda,regex,desde){//recibe la busqueda y la expresion regular

    return new Promise((resolve, reject) => {

        let total;

         Medico.find({ nombre: regex },'nombre usuario hospital')
               
              .exec((err, medicos) => {

               total = medicos.length;
            });



        Medico.find({ nombre: regex },'nombre usuario hospital image')
               .skip(desde)  //desde que indice 
               .limit(5) 
              .populate('usuario', 'nombre email image')
              .populate('hospital')
              .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {


                    Medico.find({nombre:regex}).count({}, (err, totalMedicos) => {

                            resolve({'usuarios':medicos,'total':totalMedicos})
                     
                    })

                    //resolve({'usuarios':medicos,'total':total})
                }
        });
    });
}


function buscarUsuarios(busqueda,regex,desde){//recibe la busqueda y la expresion regular

    return new Promise((resolve, reject) => {

        let total;

         Usuario.find({},'nombre email role image')
              .or([{ 'nombre':regex }, { 'email':regex }])
              
              .exec((err, usuario) => {

          
                 total=usuario.length;
            });



        Usuario.find({},'nombre email role image')
              .or([{ 'nombre':regex }, { 'email': regex }])
              .skip(desde)  //desde que indice 
              .limit(5) 
              .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {

                    Usuario.find({})
                           .or([{ 'nombre':regex }, { 'email': regex }])
                           .count({}, (err, totalUsuarios) => {

                            resolve({'usuarios':usuarios,'total':totalUsuarios})
                     
                    })
                     
                                   
                }
            });
    });
}




module.exports = app;


/*

CREAR PROCESOS ASINCRONOS

PARA BUSCAR SIMPLE EN  HOSPITALES EN UN TABLA

app.get('/todo/:busqueda', (req, res,next) => { //parametro todo/:busqueda

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda,'i')//combertir Busqueda en expresion rtegular (i)=> para keysensible 

    Hospital.find({nombre:regex},(err,hospitales)=>{
      
    res.status(200).json({
        ok:true,
        hospitales:hospitales
    })

    })



   
    
});
*/

