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
var Usuario = mongoose.model('Usuario');

var async = require('async');
var _ = require('lodash');

/* GET DE TODOS LOS LIBROS DE UN USUARIO:
    Recupera todos los libros del usuario que envío el token.
*/
router.get('/', function (req, res, next) {
  // Se llama a la función que recupera los libros de un usuario con el callback
  // para responder a la petición
  recuperar_libros_usuario(req.decoded_token.email, function (error, lista_libros) {
    res.json(lista_libros);
  });
});

/* GET DE LIBROS CON FILTRO
    Recupera la lista de libros del usuario filtrada por las opciones de la query recibida
*/
router.get('/:query', function (req, res, next) {
  // Se llama a la función que recupera los libros de un usuario con el callback
  // para responder a la petición
  recuperar_libros_usuario(req.decoded_token.email, function (error, lista_libros) {

    if (req.params.query.search("by_title=") >= 0) {
      let valor_a_filtrar = extraer_valor_filtro_query(req.params.query, "by_title=");
      let regex_filtrado = new RegExp(`.*${valor_a_filtrar}.*`, "i");
      let array_filtrado = _.filter(lista_libros, libro => regex_filtrado.test(libro.titulo));
      res.json(array_filtrado);
    }

    if (req.params.query.search("by_isbn=") >= 0) {
      let valor_a_filtrar = extraer_valor_filtro_query(req.params.query, "by_isbn=");
      let regex_filtrado = new RegExp(`.*${valor_a_filtrar}.*`, "i");
      let array_filtrado = _.filter(lista_libros, libro => regex_filtrado.test(libro.isbn));
      res.json(array_filtrado);
    }

    if (req.params.query.search("by_comprados=") >= 0) {
      let valor_a_filtrar = extraer_valor_filtro_query(req.params.query, "by_comprados=");
      let regex_filtrado = new RegExp(`.*${valor_a_filtrar}.*`, "i");
      let array_filtrado = _.filter(lista_libros, libro => regex_filtrado.test(libro.comprado_usuario));
      res.json(array_filtrado);
    }

    if (req.params.query.search("by_leidos=") >= 0) {
      let valor_a_filtrar = extraer_valor_filtro_query(req.params.query, "by_leidos=");
      let regex_filtrado = new RegExp(`.*${valor_a_filtrar}.*`, "i");
      let array_filtrado = _.filter(lista_libros, libro => regex_filtrado.test(libro.leido_usuario));
      res.json(array_filtrado);
    }

    if (req.params.query.search("by_autor=") >= 0) {
      let valor_a_filtrar = extraer_valor_filtro_query(req.params.query, "by_autor=");
      let regex_filtrado = new RegExp(`.*${valor_a_filtrar}.*`, "i");
      let ids_autores = Autor.find({
        "nombre": regex_filtrado
      }, '_id', function (err, autores) {
        let lista_plana_ids_autores = _.map(autores, "_id");
        // Se responde con la lista de libros
        res.json(_.filter(lista_libros, libro => {
          // Array true/false según alguno de los autores del libro coincidan con alguno
          // de los buscados
          let lista_bool_coincidencias_autores = _.map(libro.autores, function (autor) {
            if (_.find(lista_plana_ids_autores, autor) !== undefined) 
              return true
            else 
              return false;
            }
          );
          // Se devuelve true si todos los valores del array de coincidencias son true
          return _.every(lista_bool_coincidencias_autores);
        }));
      });

    }
  }); // recuperar libros usuario
}); // método router

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

    // Se recupera el usuario
    var id_usuario = Usuario.findOne({
      "email": req.decoded_token.email
    }, function (err, usuario) {
      if (usuario === null) {
        return next("No existe el usuario");
      }

      // Se intenta recuperar el libro por el titulo (para comprobar si ya existe en
      // la colección Libros)
      Libro
        .findOne({
          titulo: libro.titulo
        }, function (err, libro_buscado) {
          // Si no está el libro en la colección Libros, se añade a la misma, el id del
          // libro en la colección Autores y a la lista de libros del usuario
          if (!libro_buscado) {
            libro.asignarAutorALibro(autor);
            autor.asignarLibroAAutor(libro);
            autor.save();
            libro.save(function (err) {

              usuario.asignarLibroaUsuario(libro);
              usuario.save(function (err) {
                if (err) 
                  return next("Error al guardar el libro en el usuario - " + err)
              });
              res.json("Libro añadido correctamente" + libro);

            });
            // Si ya existía el libro, sólo se añade a la lista de libros del usuario
          } else {

            // Si el usuario ya tiene el libro en su lista
            if (_.some(usuario.libros, {'id_libro': libro_buscado._id})) {
              res.json("El usuario ya tiene el libro en su lista");
            } else {
              usuario.asignarLibroaUsuario(libro_buscado);
              usuario.save(function (err) {
                if (err) 
                  return next("Error al guardar el libro en el usuario - " + err)
              });
              res.json("Libro añadido correctamente" + libro_buscado);
            }
          }
        });

    });
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

      // Se elimina el libro de la lista de libros del usuario
      var id_usuario = Usuario.findOne({
        "email": req.decoded_token.email
      }, function (err, usuario) {
        Usuario.update({
          _id: usuario._id
        }, {
            $pull: {
              libros: {
                "id_libro": libro._id
              }
            }
          })
          .exec(function (err, res_query) {
            if (!err) 
              res.json("Libro eliminado correctamente");
            }
          );

      });
    });
});

router.post('/cambiar-estado/', function (req, res, next) {
  // Comprobación de que vengan los parámetros necesarios y preparación
  let tipo_estado = (req.body.tipo_estado === "comprado")
    ? "comprado"
    : ((req.body.tipo_estado === "leido")
      ? "leido"
      : "")
  let fecha_a_modificar = (req.body.tipo_estado === "comprado")
    ? "fecha_comprado"
    : ((req.body.tipo_estado === "leido")
      ? "fecha_leido"
      : "")
  
  if ((tipo_estado === "") || !req.body.valor_estado){
    return next("Error en los parámetros enviados");
  }

  // Se recupera el usuario a partir del email del token
  Usuario
    .findOne({"email": req.decoded_token.email})
    .exec((function (err, resultado) {
      if (resultado.libros.length <= 0) {
        return next("El usuario no tiene libros");
      }
      
      // Se selecciona el index del libro de la lista del usuario a partir del id
      // recibido
      let index_libro = _.findIndex(resultado.libros, {
        "id_libro": mongoose.Types.ObjectId(req.body.id_libro)
      });
      // Se cambia el estado
      resultado.libros[index_libro][tipo_estado] = req.body.valor_estado;
      // Se asigna la fecha ligada al estado!!!!!!!!!!!!!!!!!!!
      console.log(typeof req.body.valor_estado);
      resultado.libros[index_libro][fecha_a_modificar] = (req.body.valor_estado === "true") ? Date.now(): null;
      resultado
        .libros[index_libro]
        .markModified(tipo_estado);
      resultado
        .libros[index_libro]
        .markModified(fecha_a_modificar);
      resultado.save(function (err) {
        if (err) 
          console.log(err);
        console.log(resultado.libros);
        res.json("Estado cambiado correctamente");
      });
    }));
});

/*
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

      // Se elimina el libro de la lista de libros del usuario
      var id_usuario = Usuario.findOne({
        "email": req.decoded_token.email
      }, function (err, usuario) {
        //console.log(usuario); usuario.quitarLibroUsuario(libro);
        console.log(libro._id);
        Usuario.update({
          _id: usuario._id
        }, {
          $pull: {
            libros:
              {
                "id_libro": libro._id
              }
            }
          }).exec();

          // Eliminación del libro
          Libro.findByIdAndRemove({
            _id: req.params.id
          }, function (err) {
            if (err) {
              return next("Error eliminando el libro - " + err.errmsg);
            }
          });
          res.json("Libro eliminado correctamente");
        });
    });

  });*/



// Función que recupera una lista de libros de usuario a partir de un email. Se
// le paso el callback(err, lista_libros)
let recuperar_libros_usuario = (email, callback_final) => {
  // Async waterfall general
  async.waterfall([
    // Función que recupera el objeto del usuario (colección Usuario) con sus libros
    // a partir del email del token
    function (callback) {
      let lista_id_books = Usuario
        .findOne({"email": email})
        .select('libros.id_libro libros.comprado libros.leido')
        .exec(callback);
    },
    // Función que recupera todos los libros (colección Libro) de la lista de ids de
    // libro (colección Usuario)
    function (lista_id_libros, callback) {
      Libro
        .find({
          "_id": {
            $in: _.map(lista_id_libros.libros, 'id_libro')
          }
        })
        .exec(function (err, res_query) {
          callback(null, res_query, lista_id_libros.libros)
        });
    },
    // Función que añade a la lista de libros (colección Libro) con los datos
    // completos los campos de comprado y leído (colección Usuario)
    function (lista_libros, lista_libros_raw, callback) {
      lista_libros = _.map(lista_libros, function (libro) {
        let libro_raw = _.find(lista_libros_raw, {"id_libro": libro._id});
        let campos_to_add = {
          comprado_usuario: libro_raw.comprado,
          leido_usuario: libro_raw.leido
        };
        return _.assign({}, libro._doc, campos_to_add);
      });
      callback(null, lista_libros);
    }
  ], callback_final); // waterfall
}

//Función que extraer el valor a filtrar pasado en la query según un criterio
let extraer_valor_filtro_query = (query, criterio) => query.split(criterio)[1];

// Se exporta el router definido para que otros elementos de la aplicación lo
// puedan utilizar.
module.exports = router;