// Requires necesarios.
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Definición del esquema.
var UsuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    nick: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tipo: {
        type: String
    },
    libros: [
        {
            id_libro: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Libro'
            },
            leido: {
                type: Boolean,
                default: false
            },
            fecha_leido: {
                type: Date,
                default: null
            },
            comprado: {
                type: Boolean,
                default: false
            },
            fecha_comprado: {
                type: Date,
                default: null
            }
        }
    ]
}, {timestamps: true});

// Middleware que se ejecuta antes de cada 'save'
UsuarioSchema.pre('save', function (next) {
    var usuario = this;
    // Si no se modificó el password del usuario, no se genera el hash
    if (!usuario.isModified('password')) {
        return next();
    }

    // Generación del hash
    bcrypt
        .hash(usuario.password, null, null, function (err, hash) {
            if (err) 
                return next(err);
            
            usuario.password = hash;
            next();
        });
});

//----- Definición de métodos

/* Método que compara un password plano con su hash*/
UsuarioSchema.methods.comparePassword = function (password) {
    var usuario = this;
    return bcrypt.compareSync(password, usuario.password);
};

/* Método que asigna un autor a un libro, añadiendo su id al array de autores*/
UsuarioSchema.methods.asignarLibroaUsuario = function (libro) {
    this
        .libros
        .push({id_libro: libro});
};


// Compilación del modelo a partir del schema.
mongoose.model('Usuario', UsuarioSchema);
