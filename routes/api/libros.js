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

var async = require('async');

/* GET DE TODOS LOS LIBROS:
    Utiliza el método find del modelo mongoose con condición vacía para
    recuperar todos los libros de la colección.
*/
router.get('/', function (req, res, next) {
  Libro
    .find({}, function (err, libros) {
      if (err) {
        return next("Error recuperando la lista de libros - " + err.errmsg);
      }
      //console.log(req.decoded_token.email);
      res.json(libros);
    });
  
});

/* GET DE UN LIBRO:
    Utiliza el método findOne del modelo mongoose a partir de la query correspondiente
*/
router.get('/:query', function (req, res, next) {
  let search_type = "";
  let query_string = "";

  //----- Caso búsqueda por título
  if (req.params.query.search("by_title=") >= 0) {
    query_string = req
      .params
      .query
      .split("by_title=")[1];
    Libro.find({
      "titulo": new RegExp(`.*${query_string}.*`, "i")
    }, function (err, libro) {
      if (err) {
        return next("Error recuperando el libro - " + err.errmsg);
      }
      res.json(libro);
    });
  }

  //----- Caso búsqueda por isbn
  if (req.params.query.search("by_isbn_13=") >= 0) {
    query_string = req
      .params
      .query
      .split("by_isbn_13=")[1];
    Libro.findOne({
      "isbn": new RegExp(`.*${query_string}.*`, "i")
    }, function (err, libro) {
      if (err) {
        return next("Error recuperando el libro - " + err.errmsg);
      }
      res.json(libro);
    });
  }

  //----- Caso búsqueda libros comprados
  if (req.params.query.search("by_comprados=") >= 0) {
    query_string = req
      .params
      .query
      .split("by_comprados=")[1];
    Libro.find({
      "comprado": query_string
    }, function (err, libros) {
      if (err) {
        return next("Error recuperando el libro - " + err.errmsg);
      }
      res.json(libros);
    });
  }

  //----- Caso búsqueda libros leídos
  if (req.params.query.search("by_leidos=") >= 0) {
    query_string = req
      .params
      .query
      .split("by_leidos=")[1];
    Libro.find({
      "leido": query_string
    }, function (err, libros) {
      if (err) {
        return next("Error recuperando el libro - " + err.errmsg);
      }
      res.json(libros);
    });
  }

  //----- Caso búsqueda por autor
  if (req.params.query.search("by_autor=") >= 0) {
    query_string = req
      .params
      .query
      .split("by_autor=")[1];

    // Async waterfall general
    async.waterfall([
      // Función que busca los autores y manda la lista a la siguiente
      function (callback) {
        Autor.find({
          "nombre": new RegExp(`.*${query_string}.*`, "i")
        }, '_id').exec(callback);
      },
      // Función que transforma la lista de objetos con id a una lista de id de
      // autores
      function (lista_autores, callback) {
        let lista_id_autores = [];
        async.each(lista_autores, function (autor, callback) {
          lista_id_autores.push(autor._id);
        }, function (err) {});   
        callback(null, lista_id_autores);
      },
      // Función que recupera todos los libros de todos los autores correspondientes
      function (lista_id_autores, callback) {
        console.log(lista_id_autores);
        Libro.find({
            "autores": {
              $elemMatch: {
                $in: lista_id_autores
              }
            }
          }).exec(callback);
      },
      // Función que envía la respuesta con los libros
      function (lista_libros, callback) {
        res.json(lista_libros);
      }
    ]);// waterfall

  }// caso búsqueda por autor

});// método router


/* POST DE UN LIBRO:
    Recibe parámetros asociados a la petición POST, crea una nueva instancia
    del modelo Libro, le asigna un autor, asigna el libro al autor y guarda ambos.
*/
router.post('/', function (req, res, next) {
  var body_libro = req.body;
  if (!body_libro.titulo) {
    return next("Datos de libro incorrectos - " + err.errmsg);
  }
  var libro = new Libro({
    "titulo": req.body.titulo,
    "leido": false,
    "comprado": false,
    "url_imagen_portada": req.body.url_imagen_portada,
    "isbn": req.body.isbn || "",
    "tipo_isbn": req.body.tipo_isbn || "",
    "id_google_books": req.body.id_google_books || "",
    "descripcion": req.body.descripcion
  });
  var id_autor = Autor.findOne({
    nombre: req.body.autor
  }, function (err, autor) {
    // Si no existe el autor en la DB, se crea
    if (autor === null) {
      // Se crea un nuevo modelo Autor a partir de los parámetros recibidos
      var autor = new Autor({"nombre": req.body.autor});
      // Se intenta guardar el autor contemplando un posible error en la operación
      autor.save(function (err) {
        // Si hubo un error, se pasa al stream principal para que el manejador estándar
        // lo maneje
        if (err) 
          return next("Error al guardar el autor - " + err.errmsg);
        }
      );
    }

    libro.asignarAutorALibro(autor);
    autor.asignarLibroAAutor(libro);
    autor.save();
    libro.save(function (err) {
      if (err) {
        return next("Ya existe ese libro en la colección");
      } else {
        res.json("Libro añadido correctamente" + libro);
      }
    });
    //}
  });
});

router.delete("/:id", function (req, res, next) {
  // Eliminación del _id del libro de la lista de libros del autor
  Libro
    .findById(req.params.id, function (err, libro) {
      if (err) {
        return next("Error buscando el libro - " + err.errmsg);
      }
      if (!libro) {
        return next("No existe ese libro - " + err.errmsg);
      }
      // Se recorren todos los autores del libro
      libro
        .autores
        .forEach(function (id_autor, index) {
          Autor
            .findById(id_autor, function (err, autor) {
              if (err) {
                return next("Error buscando el autor del libro - " + err.errmsg);
              }
              console.log(autor._id);
              console.log(libro._id);
              console.log(libro.titulo);

              Autor.update({
                _id: autor._id
              }, {
                $pullAll: {
                  libros: [libro._id]
                }
              }, function (err) {
                if (err) {
                  return next("Error eliminando el id del libro en el autor - " + err.errmsg);
                }
              });
            });
        });

      // Eliminación del libro
      Libro.findByIdAndRemove({
        _id: req.params.id
      }, function (err) {
        if (err) {
          return next("Error eliminando el libro - " + err.errmsg);
        }
        //res.json("Libro eliminado correctamente");
      });
      res.json("Libro eliminado correctamente");
    });

});

/*
*/
router.post('/change-state/', function (req, res, next) {

  // Comprobación de que vengan los parámetros
  // necesarios!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Recuperación de los parámetros
  var body = req.body;

  // Recuperación del libro correspondiente
  var id_libro = Libro.findById(body.id_book, function (err, libro) {
    // Si no existe el libro en la DB
    if (libro === null) {
      return next("No existe el libro");
    }

    // Se llama al método del modelo
    libro.cambiarEstado(body.state_type, body.new_state);

    // Se guardan los cambios
    libro.save(function (err) {
      if (err) {
        return next("Error al cambiar el estado y guardar");
      } else {
        res.json("Estado cambiado correctamente");
      }
    });
  });
});

// Se exporta el router definido para que otros elementos de la aplicación lo
// puedan utilizar.
module.exports = router;