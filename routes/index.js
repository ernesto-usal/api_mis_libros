var router = require('express').Router();

router.use('/api', require('./api'));
router.use('/', function(req, res, next){
  res.send("-- API DE LIBROS CREADA UTIZANDO EXPRESS Y NODEJS --<br/>"+
            "<br/>Puntos de entrada (es necesario token de identificación para todos menos /api/autentificación):<br/>"+
            "POST /api/autentificacion con un email válido y contraseña para recibir un token de identificación<br/>"+
            "POST /api/usuarios con email y password registrar un usuario<br/>"+
            "GET /api para acceder al punto principal de la api<br/>"+
            "GET /api/autores para el listado de todos los autores<br/>"+
            "GET /api/libros para el listado de todos los libros<br/>"+
            "GET /api/usuarios para el listado de todos los usuarios<br/>"+
            "GET /api/libros/<id_del_libro> para recuperar un libro por su id en la DB<br/>"+
            "GET /api/autores/<id_del_autor> para recuperar un autor por su id en la DB<br/>");
});

module.exports = router;
