
var express = require('express')
var app = express();


app.get('/', (req, res,next) => {
   
    res.status(200).json({
        ok:true,
        mensaje:'Peticion relizada correctamente status  200'
    })
    
});

module.exports = app;

