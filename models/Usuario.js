// Requires necesarios.
var mongoose = require('mongoose');

// Definición del esquema.
var UsuarioSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  nick: {type: String, unique: true},
  password: {type: String},
  tipo: {type: String}
}, {timestamps: true});


//Definición de métodos


// Compilación del modelo a partir del schema.
mongoose.model('Usuario', UsuarioSchema);
