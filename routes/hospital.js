

var express = require('express');

var mdlAutenticacion = require('../middlewares/autenticacion');

var app = express();

//importar el modelo de usuario

var Hospital = require('../models/hospital')




//OBTENER TODOS LOS HOSPITALES


app.get('/', (req, res,next) => {

    var desde = req.query.desde || 0;
        desde = Number(desde);

    Hospital.find({},'nombre image usuario').populate('usuario','nombre email')//populate para mostar las referencias 
            .skip(desde)
            .limit(5)
            .exec(
                (err,hospital)=>{

                if(err){
                    return res.status(500).json({
                        ok:false,
                        mensaje:'Error cargando usuario (Base de datos)',
                        errors:err
                    }) 
                }

                Hospital.count({}, (err, totalHospitales) => {

                    res.status(200).json({
                        ok: true,
                        hospitalAll: hospital,
                        totalHospitales: totalHospitales
                    });
                })
                
            })
    
   
    
});

// ==========================================
//  OBTENER HOISPITAL POR id
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre image email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospitalPorID: hospital
            });
        })
})

//ACTUALIZAR Hospital

app.put('/:id', mdlAutenticacion.verificaToken,(req,res)=>{

    var id= req.params.id;

    var body = req.body;

    Hospital.findById(id,(err,hospital)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al Buscar hospital ',
                errors:err
            }) 
        }
        if(!hospital){
            return res.status(400).json({
                ok:false,
                mensaje:'El hospital con el '+id+ 'no existe',
                errors:{mesagge:'No existe un usuario con este Id'}
            }) 
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id //viene de la autenticacion 
        hospital.save((err,hospitalGuardado)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al Actualizar hospital ',
                    errors:err
                })

            }  
           res.status(200).json({
                ok:true,
                hospitalActualizado:hospitalGuardado
            })
        })



    })

 

})





//CREAR hOSPITAL

app.post('/',mdlAutenticacion.verificaToken,(req,res)=>{

    var body = req.body;

    var hospital = new Hospital({
        nombre:body.nombre,
        usuario:req.usuario._id
    });

    hospital.save((err,hospitalGuardado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                mensaje:'Error al crear  hospital ',
                errors:err
            }) 
        }
 
        res.status(201).json({
            ok:true,
            hospital:hospitalGuardado
        })

    })

})

//ELIMINAR HOSPITAL

app.delete('/:id',mdlAutenticacion.verificaToken,(req,res)=>{

    var id= req.params.id;
    Hospital.findByIdAndRemove(id,(err,hospitalBorrado)=>{

        
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al Borrar hospital ',
                errors:err
            })

        } 
        if(!hospitalBorrado){
            return res.status(400).json({
                ok:false,
                mensaje:'El hospital  con el Id: '+id+ '  no existe',
                errors:{mesagge:'No existe un hospital con este Id'}
            }) 
        }
    
        res.status(200).json({
            ok:true,
            hospitalBorrado:hospitalBorrado
        })



    })

})



module.exports = app;
