/* 
  -- Descripción general --
  Este archivo es el principal de la aplicación.
  La primera cosa que se hace es declarar las variables con los require
  correspondientes que se van a utilizar más adelante.
  La variable principal en este caso es app, que se inicializará con la 
  llamada a la función express(). App es la variable global del framework 
  express, con la que se trabajará para añadirle middlewares de todo tipo
  (librerías que utilizará la app), routers para las redirecciones y control
  de errores entre otros.
  Después de la inicialización de la app y las variables que utilizará la 
  misma, se inicializará la variable server con app.listen para que el servidor
  web se inicie a la espera de peticiones.
*/

var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken')
    config = require('./config');

var isProduction = process.env.NODE_ENV === 'production';

// Creación de la variable global app de Express.
var app = express();

// Use de CORS para poder hacer peticiones a la API desde otros dominios.
app.use(cors());

// Use de morgan para que se escriba en consola un log de la peticiones HTTP.
app.use(require('morgan')('dev'));

// Use de bodyparser para que los formularios enviados por POST se reflejen en req.body.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use de errorHandler para el manejo estándar de errores en entorno de desarrollo.
if (!isProduction) {
  app.use(errorhandler());
}

// Conexión a la DB
if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  //mongoose.connect('mongodb://ernesto.boado.prog:pass@ds029715.mlab.com:29715/mislibrosdb');
  mongoose.connect(config.url_database);
  mongoose.set('debug', true);
}

// Recuperación de la variable secret_jwt para el sistema de identificación por token
app.set('secret_jwt', config.secret_jwt);

// Require de los modelos
require('./models/Libro');
require('./models/Autor');
require('./models/Usuario');

// Use del router que contiene todos los demás de la aplicación
app.use(require('./routes'));

// Función de manejo de errores para entorno de desarrollo
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500);
    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// Set up del servidor
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
