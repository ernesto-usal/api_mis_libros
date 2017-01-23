var router = require('express').Router();

router.use('/libros', require('./libros'));
router.use('/autores', require('./autores'));
router.use('/', function(req, res, next){
  res.send("PUNTO PRINCIPAL DE LA API");
});

module.exports = router;