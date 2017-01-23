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
var Autor = mongoose.model('Autor');

/* GET DE TODOS LOS AUTORES:
    Utiliza el método find del modelo mongoose con condición vacía para
    recuperar todos los autores de la colección.
*/ 
router.get('/',  function(req, res, next) {
    Autor.find({}, function(err, autores){
      if(err){
        return next("Error recuperando la lista de autores - "+err.errmsg);
      }
      res.json(autores);
    });
});

/* GET DE UN AUTOR POR ID:
    Utiliza el método findOne del modelo mongoose con la condición de que
    el _id sea igual al id pasado como parámetro en la petición para 
    devolver el autor requerido.
*/
router.get('/:id', function(req, res, next){
  Autor.findOne({_id : req.params.id}, function(err, autor){
    if(err) {
      return next("Error recuperando el autor - "+err.errmsg);
    }
    res.json(autor);
  });
});

/* POST DE UN AUTOR:
    Recibe parámetros asociados a la petición POST, crea una nueva instacia
    del modelo Autor y la guarda en la colección.
*/
router.post('/', function(req, res, next){
  var body_autor = req.body;
  // Se comprueba si en los parámetros viene el título obligatorio
  if (!body_autor.nombre){
    return next("Datos de autor incorrectos - ");
  }
  // Se crea un nuevo modelo Autor a partir de los parámetros recibidos
  var autor = new Autor(req.body);
  // Se intenta guardar el autor contemplando un posible error en la operación
  autor.save(function(err){
    // Si hubo un error, se pasa al stream principal para que el manejador estándar lo maneje
    if(err){
      return next("Error al guardar el autor - "+err.errmsg);
    } else{
      res.send("Inserción correcta");
    }
  });
});

// Se exporta el router definido para que otros elementos de la aplicación 
// lo puedan utilizar.
module.exports = router;