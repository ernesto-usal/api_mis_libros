// Parámetros de configuración de la DB
var user_database = "ernesto.boado.prog",
    pass_database = "pass",
    url_database = 'mongodb://'+user_database+':'+pass_database+'@ds029715.mlab.com:29715/mislibrosdb',
    secret_jwt = "mifrasesecreta";
var config = {
  "user_database" : user_database,
  "pass_database" : pass_database,
  "secret_jwt" : secret_jwt,
  "url_database" : url_database
};

module.exports = config;