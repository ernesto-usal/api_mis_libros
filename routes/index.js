var router = require('express').Router();

router.use('/api', require('./api'));
router.use('/', function(req, res, next){
  res.send("-- API DE LIBROS CREADA UTIZANDO EXPRESS Y NODEJS --<br/>"+
            "<br/>Puntos de entrada (es necesario token de identificación para todos menos /api/usuarios/login"+
            " y /api/usuarios/signup:<br/>"+
            "El token de identificación se incluirá en los headers con x-access-token=token_válido<br/><br/>"+
            "POST /api/usuarios/login con email=email_válido y password=contraseña_válida para recibir un token de identificación<br/><br/>"+
            "POST /api/usuarios/signup con email=email_válido y password=contraseña_válida para registrar un usuario y recibir un token de identificación<br/><br/>"+
            "GET /api/autores para el listado de todos los autores del sistema<br/><br/>"+
            "GET /api/libros para el listado de todos los libros del usuario<br/><br/>"+
            "GET /api/libros/query_válida para lista filtrada. query_válida puede contener by_title=título, by_isbn=isbn, by_autor=autor, by_comprados=true o false o by_leidos=true o false<br/><br/>"+
            "POST /api/libros para añadir un libro. En el body de la petición habra que incluír:<br>"+
            `   titulo,
                url_imagen_portada,
                isbn,
                tipo_isbn,
                id_google_books,
                descripcion<br/><br/>`+
            "DELETE /api/libros/id_del_libro_a_eliminar para eliminar un libro del usuario<br/><br/>"+
            "POST /api/libros/cambiar-estado/ para cambiar el estado de comprado o leído de un libro incluyendo:<br/>"+
            "id_libro (con el _id del libro), tipo_estado ('comprado' o 'leído'), valor_estado ('true' o 'false')<br/>");
});

module.exports = router;
