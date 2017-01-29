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
