# API REST MIS LIBROS.

<strong>(EN CONSTRUCCIÓN)</strong><br>
API REST creada utilizando la infraestructura Express sobre NodeJS y MongoDB como base de datos.

### Instalación.

* Es necesario tener instalado el entorno NodeJS. Si no está instalado, hacerlo desde la página principal de NodeJS https://nodejs.org/es/.
Incluído con el entorno ya vendrá el gestor de paquetes npm utilizado para instalar la API.
* Ejecutar el comando ```git clone dirección_repositorio``` en la carpeta donde se desee instalar el API.
* Colocarse dentro de la carpeta y ejecutar el comando ```npm install``` para inicializar el proyecto con las dependencias requeridas.
* En el fichero de entrada del servidor app.js se realiza la conexión a la base de datos utilizando las credenciales de un fichero de configuración externo. Para utilizar un base de datos propia será necesario por lo tanto crear una carpeta config en la carpeta raíz de la aplicación y un fichero index.js con el siguiente contenido:<br>
```javascript 
//Parámetros de configuración de la DB
var user_database = "usuario",
    pass_database = "contraseña",
    url_database = 'mongodb://'+user_database+':'+pass_database+'@ds029711.mlab.com:29715/mislibrosdb',
    //Clave secreta utilizada en la autentificación
    secret_jwt = "frasesecreta";
var config = {
  "user_database" : user_database,
  "pass_database" : pass_database,
  "secret_jwt" : secret_jwt,
  "url_database" : url_database
};

module.exports = config;
```
* Habrá que cambiar el contenido de user_database y pass_database por las credenciales correctas, así como url_database con la dirección de la base de datos (con las credenciales incrustadas de la misma manera que en el ejemplo).
* También se deberá cambiar la frase secreta secret_jwt utilizada en el proceso de autentificación.
* Por último, situados en la carpeta principal de la aplicación, se ejecutará el comando ```npm start``` para iniciar el servidor, por defecto en el puerto 3001.

### Puntos de entrada disponibles.

#### Sin autentificación.


#### Con autentificación.


### Autor.
Ernesto Boado