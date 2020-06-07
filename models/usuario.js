var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

var Schema= mongoose.Schema;

var rolesValidos = {
    values:['ADMIN_ROLE','USER_ROLE'],
    message:'{VALUE} no es un rol Permitido'
};


var usuarioSchema = new Schema({
    nombre:{type:String,required:[true,'El nombre es necesario']},
    email:{type:String,unique:true,required:[true,'El correo es necesario']},
    password:{type:String,required:[true,'La contraseña es necesaria']},
    image:{type:String, required:false,default:null},
    role:{type:String,required:true,default:'USER_ROLE',enum:rolesValidos}
});



usuarioSchema.plugin(uniqueValidator,{message:'el {PATH} debe ser unico'});


module.exports = mongoose.model('Usuario',usuarioSchema)


/*

const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: String,
    password: String
}, {
    timestamps: true
});

module.exports = model('User', userSchema, 'users');
*/