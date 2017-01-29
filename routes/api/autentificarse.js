// Requires necesarios
var router = require('express').Router();
var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');
var jwt = require('jsonwebtoken');
var config = require('../../config');

/* POST de autentificación
    Recibe los parámetros email y password por POST y, si son correctos,
    se devuelve un token de identificación
*/
router.post('/', function(req, res, next){
    // Se intenta recuperar el usuario a partir del email enviado por POST
    Usuario.findOne({
        "email" : req.body.email
    }, function(err, usuario){
        // Si hubo algún error al recuperar el usuario, se devuelve
        if(err) {
            return next("Error al recuperar el usuario con email=" + req.body.email + " " + err.errmsg);
        }
        // Si no existe ese usuario en la DB, se devuelve error
        if(!usuario) {
            return next("No existe el usuario con email=" + req.body.email);
        // Si existe el usuario, se comprueba que el password enviado por POST sea correcto
        } else if (usuario){
            // Si la contraseña es incorrecta, se devuelve error
            if(usuario.password != req.body.password){
                return next("Contraseña incorrecta");
            // Si la contraseña es correcta, se crea un nuevo token jwt para el usuario y se devuelve
            } else {
                var token = jwt.sign(usuario, config.secret_jwt, {
                    expiresIn: 180
                });

                res.json({
                    exito : true,
                    mensaje: "Tu token es el siguiente",
                    token : token
                });
            }
        }
    });
});


// Se exporta el router definido para que otros elementos de la aplicación 
// lo puedan utilizar.
module.exports = router;