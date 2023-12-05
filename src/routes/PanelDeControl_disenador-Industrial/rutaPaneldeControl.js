const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');

//Establecer las rutas de inicio
const rutas = express.Router();

//hacer la peticion de toda la linea de produccion
const db = require('../../dblinea_de_produccion.js');

rutas.get('/PanelDeControl_Disenador-Industrial', async(req, res)=>{
    try{
        var peticion;

        //Acceder las areas existentes 
        
        const Areas = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM Areas';
            db.all(peticion, (err, rowsAreas)=>{
                if(err) return reject(err);
                resolve(rowsAreas);
            })
        });

        const imagenesAreas = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM ImagenesAreas';
            db.all(peticion, (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        console.log(imagenesAreas);

        res.render('PanelDeControl_Disenador-Industrial/PanelDeControl', {
            fabrica:{
                id: req.params.fabrica
            },
            area: Areas,
            imagenesAreas: imagenesAreas
        });
    }catch(err){
        res.json({data: 'Error al cargar datos'});
        console.log("Error en la operacion: ".bgRed, err);
    }
});

//Ruta para renderizar las opciones de las imagenes (actualizar al agregar una o otro proceso)

rutas.post('/PanelDeControl_Ingeniero-Industrial/dataImagenes', async(req, res)=>{
    try{
        var peticion;

        //Acceder las areas existentes 
        
        const Areas = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM Areas';
            db.all(peticion, (err, rowsAreas)=>{
                if(err) return reject(err);
                resolve(rowsAreas);
            })
        });

        const imagenesAreas = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM ImagenesAreas';
            db.all(peticion, (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });
        res.render('PanelDeControl_Disenador-Industrial/opcionesImagenes', {
            area: Areas,
            imagenesAreas: imagenesAreas
        });
    }catch(err){
        console.log("Error en la operacion: ".bgRed, err);
        res.json({data: 'Error al cargar datos'});
    }
});

//Ruta para renderizar las ventanas emergentes

rutas.post('/PanelDeControl_Disenador-Industrial/contenidoVentana', async(req, res)=>{
    try{
        res.render('PanelDeControl_Disenador-Industrial/contenidoVentanaEmergente', {
            urlBlob: req.body.urlBlob,
            tipoDeSituacion: req.body.tipoDeSituacion,
        });

    }catch (err){
        console.log('Error en el procedimiento: ', err);
        res.json({data: 'Error al cargar datos'});
    }
});


module.exports = rutas;