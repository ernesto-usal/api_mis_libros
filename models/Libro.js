/*
  -- Descripción general --
  Aquí se definirá un esquema mongoose que contendrá las propiedades
  necesarias para definir un LIBRO. Para ellos se declarará una nueva
  variable mongoose.Schema que recibirá un objeto con la definición
  de las propiedades, seguido de otro opcional que contendrá una serie
  de opciones que se le pueden aplicar.
  Después de la creación del Schema, se le podrán definir métodos de
  instancia con nombre_esquema.methods.nombre_método = función, métodos
  estáticos con nombre_esquema.statics.nombre_método = función u otras
  cosas como virtuals con nombre_esquema.virtual (propiedades no
  persistentes en la base de datos como por ejemplo un nombre completo
  a las que se podrá acceder como si fuese una de las originales
  mediante la definición de get y set.
  Por último se compilará el esquema en un modelo que contendrá las
  propiedades y métodos anteriormente definidos.

  -- Relaciones entre colecciones --
  Para definir una relación n:m con otra colección, en cada uno de los
  esquemas se define una propiedad de tipo array de ObjectId y ref la
  colección relacionada, que contendrá los _id de los documentos relacionados,
  en este caso por ejemplo, tendrá los _id de los autores del libro.

*/

// Requires necesarios.
var mongoose = require('mongoose');

// Definición del esquema.
var LibroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    unique: true
  },
  leido: {
    type: Boolean
  },
  comprado: {
    type: Boolean
  },
  url_imagen_portada: {
    type: String
  },
  isbn: {
    type: String
  },
  tipo_isbn: {
    type: String
  },
  id_google_books: {
    type: String
  },
  descripcion: {
    type: String
  },
  autores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Autor'
    }
  ]
}, {timestamps: true});

//Definición de métodos
/* Método que asigna un autor a un libro, añadiendo su id al array de autores*/
LibroSchema.methods.asignarAutorALibro = function (autor) {
  this
    .autores
    .push(autor);
};

/* Método que cambia el estado de un libro*/
LibroSchema.methods.cambiarEstado = function (tipo_estado, nuevo_estado) {
  (tipo_estado === "leido")
    ? this.leido = nuevo_estado
    : ((tipo_estado === "comprado")
      ? this.comprado = nuevo_estado
      : null)
};

// Compilación del modelo a partir del schema.
mongoose.model('Libro', LibroSchema);
