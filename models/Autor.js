/*
  -- Descripción general --
  Aquí se definirá un esquema mongoose que contendrá las propiedades
  necesarias para definir un AUTOR. Para ellos se declarará una nueva
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
*/

// Requires necesarios.
var mongoose = require('mongoose');

// Definición del esquema.
var AutorSchema = new mongoose.Schema({
  nombre: {type: String, unique: true},
  libros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Libro' }],
}, {timestamps: true});

//Definición de métodos
/* Método que asigna un autor a un libro, añadiendo su id al array de autores*/
AutorSchema.methods.asignarLibroAAutor = function(libro){
        this.libros.push(libro);
};

// Compilación del modelo a partir del schema.
mongoose.model('Autor', AutorSchema);
