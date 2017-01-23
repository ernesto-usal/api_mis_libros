/*
  -- Descripción general --
  Cada router es un middleware utilizado por la variable global app 
  para direccionar las peticiones.
  Primero se hacen los requires necesarios, a continuación se definen 
  las rutas utilizando los métodos get, post,etc del router y, por 
  último, se exporta el router para que la app u otro router pueda
  hacer uso de él.

  -- Uso de métodos del router --
  Cada método del router con un nombre de método HTTP (get, post, etc)
  recibe un string con la ruta que reconocerá y una función o varias
  funciones de callback que ejecutará a continuación.
  La función de callback recibe como parámetros la request, la response 
  y next (función cuya invocación sirve para saltar a la siguiente 
  función de callback si hay varias definidas).

  -- Uso de parámetros en la petición --
  Los parámetros de la request de una petición GET se guardarán en 
  req.params.nombre_parámetro, reconociendo el router como parámetro 
  los que se indiquen en el string de la ruta como :nombre_parámetro.
  Para recibir varios parámetros se separan en el string de la ruta con
  puntos.
  Para utilizar los parámetros de una petición POST, primero es necesario 
  que la variable global app se configure en el js principal de la aplicación 
  para que use bodyParser.urlencode({extended: true}) y bodyParser.json().
  De esta manera, se podrá acceder a los parámetros en el método post del 
  router con req.body.nombre_parámetro.

  -- Aplicar middlewares al router --
  Al igual que a la app global, a los routers se les puede aplicar middlewares 
  con router.param() que permitirán reconocer un parámetro determinado en la
  petición y realizar alguna acción con él antes de ejecutar el método de la ruta
  del router (get, post, etc).
  router.param() recibirá como parámetros un string con el parámetro a reconocer 
  y una función de callback con req, res y next.
*/


// Requires necesarios
var router = require('express').Router();
var mongoose = require('mongoose');
var Libro = mongoose.model('Libro');
var Autor = mongoose.model('Autor');

/* GET DE TODOS LOS LIBROS:
    Utiliza el método find del modelo mongoose con condición vacía para
    recuperar todos los libros de la colección.
*/ 
router.get('/',  function(req, res, next) {
    Libro.find({}, function(err, libros){
      if(err){
        return next("Error recuperando la lista de libros - "+err.errmsg);
      }
      res.json(libros);
    });
});

/* GET DE UN LIBRO POR ID:
    Utiliza el método findOne del modelo mongoose con la condición de que
    el _id sea igual al id pasado como parámetro en la petición para 
    devolver el libro requerido.
*/
router.get('/:id', function(req, res, next){
  Libro.findOne({_id : req.params.id}, function(err, libro){
    if(err) {
      return next("Error recuperando el libro - "+err.errmsg);
    }
    res.json(libro);
  });
});

/* POST DE UN LIBRO:
    Recibe parámetros asociados a la petición POST, crea una nueva instancia
    del modelo Libro, le asigna un autor, asigna el libro al autor y guarda ambos.
*/
router.post('/', function(req, res, next){
  var body_libro = req.body;
  if (!body_libro.titulo){
    return next("Datos de libro incorrectos - "+err.errmsg);
  }
  var libro = new Libro({"titulo" : req.body.titulo});
  var id_autor = Autor.findOne({nombre : req.body.autor}, function(err, autor){
    if(autor===null){
      return next("No existe ese autor");
    } else{
      libro.asignarAutorALibro(autor);
      autor.asignarLibroAAutor(libro);
      autor.save();
      libro.save(function(err){
        if(err){
          return next("Ya existe ese libro en la colección");
        } else {
          res.json("Libro añadido correctamente" + libro);
        }
      });
    }
  });
});


// Se exporta el router definido para que otros elementos de la aplicación 
// lo puedan utilizar.
module.exports = router;