
var express = require('express')
var app = express();
const path = require('path');
const fs = require('fs');


app.get('/:tipo/:image', (req, res,next) => {

    var tipo = req.params.tipo;
    var image = req.params.image;
   
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ image }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }
    
});

module.exports = app;