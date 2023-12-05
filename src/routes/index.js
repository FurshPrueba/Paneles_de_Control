const  express = require('express');
const  body_parser = require('body-parser');
const  ejs = require('ejs-mate');
const  colors = require('colors');

//Establecer las rutas de inicio
const rutas = express.Router();

rutas.get('/', (req, res)=>{
    res.render('index');
});


module.exports = rutas;