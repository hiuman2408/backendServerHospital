var express = require('express');

var mdlAutenticacion = require('../middlewares/autenticacion');

var app = express();

//importar el modelo de usuario

var Medico = require('../models/medico')




//OBTENER TODOS LOS MedicoES


app.get('/', (req, res,next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

   Medico.find({},'nombre image usuario hospital').populate('usuario','nombre email').populate('hospital')
        .skip(desde)
        .limit(5)
        .exec(
            (err,medico)=>{

            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje:'Error cargando usuario (Base de datos)',
                    errors:err
                }) 
            }

            Medico.count({}, (err, totalMedicos) => {

                res.status(200).json({
                    ok: true,
                    medicos: medico,
                    total: totalMedicos
                });
            });
            
        });

     
});

//OBTENER UN MEDICO POR SUA ID
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });

        })


});


//ACTUALIZAR MEDICO

app.put('/:id', mdlAutenticacion.verificaToken,(req,res)=>{

    var id= req.params.id;

    var body = req.body;

    Medico.findById(id,(err,medico)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al Buscar hospital ',
                errors:err
            }) 
        }
        if(!medico){
            return res.status(400).json({
                ok:false,
                mensaje:'El medico con el '+id+ 'no existe',
                errors:{mesagge:'No existe un medico con este Id'}
            }) 
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id //viene de la autenticacion 
        medico.hospital = body.hospital;
    
        medico.save((err,medicoGuardado)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al Actualizar medico ',
                    errors:err
                })

            }

           res.status(200).json({
                ok:true,
                medico:medicoGuardado
            })
        })



    })

 

})

//CREAR UN MEDICO

app.post('/', mdlAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });


    });

});

//ELIMINAR MEDICO

app.delete('/:id',mdlAutenticacion.verificaToken,(req,res)=>{

    var id= req.params.id;
    Medico.findByIdAndRemove(id,(err,medicoBorrado)=>{

        
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al Borrar medico ',
                errors:err
            })

        } 
        if(!medicoBorrado){
            return res.status(400).json({
                ok:false,
                mensaje:'El medico  con el Id: '+id+ '  no existe',
                errors:{mesagge:'No existe un medico con este Id'}
            }) 
        }


        
        res.status(200).json({
            ok:true,
            medico:medicoBorrado
        })



    })

})



module.exports = app;