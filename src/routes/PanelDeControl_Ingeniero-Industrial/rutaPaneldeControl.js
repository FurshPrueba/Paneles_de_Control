const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');

//Establecer las rutas de inicio
const rutas = express.Router();


//hacer la peticion de toda la linea de produccion
const db = require('../../dblinea_de_produccion.js');


rutas.get('/PanelDeControl_Ingeniero-Industrial', async(req, res)=>{
    try{
        var peticion;
        
        //Acceder a
        const productos = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM Productos ORDER BY productosID DESC';
            db.all(peticion, (err, rowsProductos)=>{
                if(err) return reject(err);
                resolve(rowsProductos);
            })
        });
        
        const Areas = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM Areas';
            db.all(peticion, (err, rowsProductos)=>{
                if(err) return reject(err);
                resolve(rowsProductos);
            })
        });
        

        res.render('PanelDeControl_Ingeniero-Industrial/PanelDeControl', {
            fabrica:{
                id: req.params.fabrica
            },
            area: Areas,
            productos: productos,
            codigoEstado: productos.codigoEstado
        });
    }catch(err){
        console.log("Error en la operacion: ".bgRed, err);
    }
});

//Ruta para renderizar las opciones de UN producto (un unico al ser clicliados)

rutas.post('/PanelDeControl_Ingeniero-Industrial/dataProducto', async(req, res)=>{
    try{
        var peticion;

        const codigoLectura = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT codigoLectura, productosID FROM Productos WHERE productosID = ?';
            db.all(peticion, [req.body.id], (err, rowsProductos)=>{
                if(err) return reject(err);
                resolve(rowsProductos);
            })
        });


        res.render('PanelDeControl_Ingeniero-Industrial/opcionesProducto', {
            codigoLectura: codigoLectura
        });
    }catch (err){
        console.log('Error en el procedimiento: ', err);
    }
});



rutas.post('/PanelDeControl_Ingeniero-Industrial/contenidoVentana', async(req, res)=>{
    try{
        res.render('PanelDeControl_Ingeniero-Industrial/contenidoVentanaEmergente', {
            tipoRespuesta: req.body.tipoRespuesta,
            tipoDeSituacion: req.body.tipoDeSituacion,
            direccionalidadConectorHijoInicial: req.body.direccionalidadConectorHijoInicio,
            direccionalidadConectorHijoFinal: req.body.direccionalidadConectorHijoFinal,
            direccionalidadConectorPadre: req.body.direccionalidadConectorPadre
        });

    }catch (err){
        console.log('Error en el procedimiento: ', err);
    }
});

module.exports = rutas;