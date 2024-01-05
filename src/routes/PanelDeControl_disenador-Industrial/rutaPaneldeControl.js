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

        const gamasP = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM GamasProductos';
            db.all(peticion, (err, rowsGamasP)=>{
                if(err) return reject(err);
                resolve(rowsGamasP);
            })
        });

        const versiones = await new Promise ((resolve, reject)=>{
            peticion = 'SELECT * FROM versionesP';
            db.all(peticion, (err, rowsVersiones)=>{
                if(err) return reject(err);
                resolve(rowsVersiones);
            })
        });

        res.render('PanelDeControl_Disenador-Industrial/PanelDeControl', {
            fabrica:{
                id: req.params.fabrica
            },
            versiones: versiones,
            gamasP: gamasP,
        });
    }catch(err){
        res.json({data: 'Error al cargar datos'});
        console.log("Error en la operacion: ".bgRed, err);
    }
});

//Ruta para renderizar las opciones de las imagenes (actualizar al agregar una o otro proceso)

rutas.post('/PanelDeControl_Disenador-Industrial/dataImagenes', async(req, res)=>{
    try{
        var peticion;
                
        //Acceder las areas existentes 
        
        //Estas son todas las areas del producto
        const Areas = await new Promise((resolve, reject) => {
            peticion = `SELECT * FROM "${req.body.nombreAreasVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion, (err, rowsAreas) => {
                if (err) return reject(err);
                resolve(rowsAreas);
            });
        });

        //El Codigo qeu representa el orden de las areas
        const codigos_Areas = await new Promise ((resolve, reject)=>{
            peticion = `SELECT * FROM "${req.body.nombreOrdenAreasVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion , (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        //Son todas las imagenes de las areas
        const imagenesAreas = await new Promise ((resolve, reject)=>{
            peticion = `SELECT * FROM "${req.body.nombrePasosVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion, (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        //El Codigo que representa el orden de las imagenes
        const codigos_Imagenes = await new Promise ((resolve, reject)=>{
            peticion = `SELECT * FROM "${req.body.nombreOrdenPasosVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion , (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        res.render('PanelDeControl_Disenador-Industrial/opcionesImagenes', {
            area: Areas,
            codigos_Areas: codigos_Areas,
            codigos_Imagenes: codigos_Imagenes,
            imagenesAreas: imagenesAreas
        });
    }catch(err){
        console.log("Error en la operacion: ".bgRed, err);
        res.json({data: 'Error al cargar datos'});
    }
});

//Ruta para renderizar las opciones de las imagenes (actualizar al agregar una o otro proceso)

rutas.post('/PanelDeControl_Disenador-Industrial/dataDuplicar', async(req, res)=>{
    try{
        var peticion;
        
        //Acceder las areas existentes 
        
        //Estas son todas las areas del producto
        const Areas = await new Promise((resolve, reject) => {
            peticion = `SELECT * FROM "${req.body.nombreAreasVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion, (err, rowsAreas) => {
                if (err) return reject(err);
                resolve(rowsAreas);
            });
        });

        //El Codigo qeu representa el orden de las areas
        const codigos_Areas = await new Promise ((resolve, reject)=>{
            peticion = `SELECT * FROM "${req.body.nombreOrdenAreasVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion , (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        //Son todas las imagenes de las areas
        const imagenesAreas = await new Promise ((resolve, reject)=>{
            peticion = `SELECT * FROM "${req.body.nombrePasosVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion, (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        //El Codigo que representa el orden de las imagenes
        const codigos_Imagenes = await new Promise ((resolve, reject)=>{
            peticion = `SELECT * FROM "${req.body.nombreOrdenPasosVersion}"`; // Concatenar directamente el nombre de la tabla en la consulta
            db.all(peticion , (err, rowsImagenes)=>{
                if(err) return reject(err);
                resolve(rowsImagenes);
            })
        });

        res.render('PanelDeControl_Disenador-Industrial/duplicarVersion', {
            area: Areas,
            codigos_Areas: codigos_Areas,
            codigos_Imagenes: codigos_Imagenes,
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
            area: req.body.area,
        });

    }catch (err){
        console.log('Error en el procedimiento: ', err);
        res.json({data: 'Error al cargar datos'});
    }
});

//Ruta para renderizar las ventanas emergentes

rutas.post('/PanelDeControl_Disenador-Industrial/cambiar_nombreArea', async(req, res)=>{
    const db = require('../../dblinea_de_produccion.js');
    try{
        //Iniciar una transaccion para p guardar los datos en la base de datos (es una base de datos sqlite 3, empezar una transaccion)
        await new Promise((resolve, reject)=>{
            db.run('BEGIN TRANSACTION', (err, row)=>{
                if(err){
                    return reject(err);
                }resolve();
                console.log("TRANSACCION INICIADA (TRANSACTION)");
            });
        });

        var Area = req.body.area;
        var nuevoNombre = req.body.nuevoNombre;
        
        //Actualizar el codigo del orden de las imagenes
        
        await new Promise((resolve, reject)=>{
            var peticion = 'UPDATE Areas SET nombreArea = ? WHERE areaID = ?';
            
            db.run(peticion,[nuevoNombre, Area], (err)=>{
                if(err){
                    return reject(err);
                }resolve();
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });
        
        

        //Termaniar la tansaccion en caso de exito
        await new Promise((resolve, reject)=>{
            db.run('COMMIT', (err)=>{
                if(err){
                    return reject(err);
                }resolve();

                console.log("TRANSACCION TERMINADA (COMMIT)");
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });

        res.json({contenido: 'thetissimethereferdts'});
    }catch (err){
        console.log('Error en el procedimiento: ', err);
        res.json({respuesta: err})
        //Termaniar la tansaccion y volver al caso anterior
        db.run('ROLLBACK');
    }
});


module.exports = rutas;