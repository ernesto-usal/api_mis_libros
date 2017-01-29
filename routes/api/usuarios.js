// Requires necesarios
var router = require('express').Router();
var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');


/* GET DE TODOS LOS USUARIOS:
    Utiliza el método find del modelo mongoose con condición vacía para
    recuperar todos los usuarios de la colección.
*/ 
router.get('/',  function(req, res, next) {
    Usuario.find({}, function(err, usuarios){
      if(err){
        return next("Error recuperando la lista de usuarios - "+err.errmsg);
      }
      res.json(usuarios);
    });
});


/* CREACIÓN DE UN NUEVO USUARIO:
    Recibe parámetros asociados a la petición POST y con ellos crea y añade a 
    la colección un nuevo usuario.
*/
router.post('/', function(req, res, next){
  var body_usuario = req.body;
  // Si no se envió email por POST, se devuelve error
  if (!body_usuario.email){
    return next("Datos de usuario incorrectos - "+err.errmsg);
  }
  // Si no se envió password por POST, se devuelve error
  if (!body_usuario.password){
    return next("Datos de usuario incorrectos - "+err.errmsg);
  }
  // Se crea un nuevo objeto Usuario a partir de los datos recibidos
  var usuario = new Usuario({
    "email" : req.body.email,
    "nick" : req.body.nick,
    "password" : req.body.password,
    "tipo" : req.body.tipo
  });
  
  // Se guarda en la DB el nuevo usuario
  usuario.save(function(err){
    if(err){
      return next("Error al guardar el usuario - " + err.errmsg);
    } else {
      res.json("Usuario añadido correctamente " + usuario);
    }
  });
});


// Se exporta el router definido para que otros elementos de la aplicación 
// lo puedan utilizar.
module.exports = router;