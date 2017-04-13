var router = require('express').Router();
var jwt = require('jsonwebtoken');
var config = require('../../config');


router.use('/usuarios', require('./usuarios'));

// Middelware de identificación con token jwt
router.use(function(req, res, next){
  // Se intenta recuperar el token ya venga por un campo de formulario POST, como parámetro de 
  // la petición GET o como header
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
  // Si se envió un token usando alguno de los medio anteriores
  if(token){
    // Se hace la verifición de que el token sea correcto utilizando el mismo token y la clave secreta
    jwt.verify(token, config.secret_jwt, function(err, decoded_token){
      if(err){
        return next("Fallo al autentificar el token");
      } else {
        req.decoded_token = decoded_token;
        next();
      }
    });
  } else {
    return next("No se ha enviado el token de autentificación");
  }
});

router.use('/libros', require('./libros'));
router.use('/autores', require('./autores'));

router.use('/', function(req, res, next){
  res.send("PUNTO PRINCIPAL DE LA API");
});

module.exports = router;