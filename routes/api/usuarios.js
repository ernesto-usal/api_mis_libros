// Requires necesarios
var router = require('express').Router();
var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');
var Libro = mongoose.model('Libro');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var async = require('async');

var isProduction = process.env.NODE_ENV === 'production';
let secret_jwt = (isProduction) ? process.env.SECRET_JWT: config.secret_jwt;

/* GET DE TODOS LOS USUARIOS:
    Devuelve todos los usuarios de la colección.
*/
router.get('/', function (req, res, next) {
  Usuario
    .find({}, function (err, usuarios) {
      if (err) {
        return next("Error recuperando la lista de usuarios - " + err.errmsg);
      }
      res.json(usuarios);
    });
});

/* REGISTRO DE UN NUEVO USUARIO:
    Recibe parámetros asociados a la petición POST y con ellos crea y añade a
    la colección un nuevo usuario.
*/
router.post('/signup', function (req, res, next) {
  // Comprobación de recepción de params Si no se envió email por POST, se
  // devuelve error
  if (!req.body.email) {
    return next("Datos de usuario incorrectos - " + err.errmsg);
  }
  // Si no se envió password por POST, se devuelve error
  if (!req.body.password) {
    return next("Datos de usuario incorrectos - " + err.errmsg);
  }
  // Se crea un nuevo objeto Usuario a partir de los datos recibidos
  var usuario = new Usuario({"email": req.body.email, "nick": req.body.nick, "password": req.body.password, "tipo": req.body.tipo});

  // Se guarda en la DB el nuevo usuario
  usuario.save(function (err) {
    if (err) {
      return next("Error al guardar el usuario - " + err.errmsg);
    } else {
      let claim_token = {
        "email": usuario.email
      };
      let token = jwt.sign(claim_token, secret_jwt, {expiresIn: "1d"});
      res.json("Usuario añadido correctamente " + usuario);
    }
  });
});

/* LOGIN DE UN USUARIO:
    Recibe parámetros asociados a la petición POST y si son correctos devuelve el JWT.
*/
router.post('/login', function (req, res, next) {
  // Comprobación de recepción de params email y password
  if (!req.body.email) {
    return next("No recibido parámetro email");
  }
  if (!req.body.password) {
    return next("No recibido parámetro password");
  }

  // Se intenta recuperar el usuario utilizando el email recibido
  Usuario
    .findOne({
      email: req.body.email
    }, function (err, usuario) {
      if (err) 
        return next("Error de autentificación - " + err.errmsg);
      
      // Si no existe un usuario con ese email
      if (!usuario) {
        return next("Error de autentificación - No existe el usuario");
      }

      // Se compara el password enviado con el hash de la base de datos
      let esPasswordCorrecto = usuario.comparePassword(req.body.password)
      if (!esPasswordCorrecto) {
        return next("Error de autentificación - Password incorrecto");
      } else {
        let claim_token = {
          "email": usuario.email
        };
        let token = jwt.sign(claim_token, secret_jwt, {expiresIn: "1d"});
        
        res.json({message: 'Login correcto', token: token});
      }
    });
});

// Se exporta el router definido para que otros elementos de la aplicación lo
// puedan utilizar.
module.exports = router;