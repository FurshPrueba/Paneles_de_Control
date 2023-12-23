const  express = require('express');
const multer = require('multer');
const  body_parser = require('body-parser');
const  colors = require('colors');
const upload = multer();
//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_disenador-Industrial/agregarArea',upload.single('BlobCortado') , async(req, res)=>{

    const db = require('../../../dblinea_de_produccion.js');
    try{
        //Iniciar una transaccion para p guardar los datos en la base de datos (es una base de datos sqlite 3, empezar una transaccion)
        await new Promise((resolve, reject)=>{
            db.run('BEGIN TRANSACTION', (err, row)=>{
                if(err){
                    return reject(err);
                }resolve();
                console.log("TRANSACTION");

            });
        });

        //Manipular los datos para agregar

        var areaAnterior = req.body.areaAnterior;
        var areaNueva = req.body.areaNueva;
        var bodegaNueva = `B${areaNueva.match(/\d+/g)[0]}`;
        var nombreArea =  req.body.nombreArea;

        var peticion;

        //CREAR EL AREA Y SU BODEGA
        await new Promise( async (resolveMacro, reject)=>{
            try {
                //Crear su bodega del area
                await new Promise((resolve, reject) => {
                    var nombreBodega = `B-${nombreArea}`
                    peticion = 
                    `INSERT INTO Areas (areaID ,nombreArea)
                    VALUES (?, ?)`;
                    
                    db.run(peticion,[bodegaNueva, nombreBodega], (err)=>{
                        if(err){
                            return reject(err);
                        }resolve();
                    });
                    setTimeout(()=>{
                        reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
                    }, 2000)
                })

                //Crear el area
                await new Promise((resolve, reject) => {
                    peticion = 
                    `INSERT INTO Areas (areaID ,nombreArea)
                    VALUES (?, ?)`;
                    
                    db.run(peticion,[areaNueva, nombreArea], (err)=>{
                        if(err){
                            return reject(err);
                        }resolve();
                        resolveMacro()
                    });
                    setTimeout(()=>{
                        reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
                    }, 2000)
                })
                

            } catch (error) {
                reject(error);
            }
        });

        //CREAR Su codigo de pasos
        await new Promise((resolve, reject)=>{
            peticion = 
            `INSERT INTO Codigo_Imagenes (areaID , codigo_ordenImagenes)
            VALUES (?, ?)`;
            
            db.run(peticion,[areaNueva, `A:${areaNueva.match(/\d+/g)[0]}[0-${areaNueva}]`], (err)=>{
                if(err){
                    return reject(err);
                }resolve();
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });
        
        //MODIFICAR EL ORDEN DE LAS AREAS
        await new Promise(async (resolveMacro, reject)=>{
            try {
                
                var codigo_OrdenAreas = await new Promise((resolve, reject) => {
                    peticion = 
                    `SELECT * FROM Codigo_Areas`;
                    
                    db.all(peticion, (err, rowCodigoArea)=>{
                        if(err){
                            return reject(err);
                        }resolve(rowCodigoArea);
                    });
                    setTimeout(()=>{
                        reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
                    }, 2000)    
                });
                
                await new Promise((resolve, reject) => {
                    console.log(codigo_OrdenAreas);
                    var indiceProducto = 0;
                    var codigoAntiguo = codigo_OrdenAreas[indiceProducto].codigo_Areas
                    var producto = codigo_OrdenAreas[indiceProducto].Producto;


                    let patron = /\[([^\[\]]+)\]/g;
                    // Buscar todas las coincidencias
                    let resultado = codigoAntiguo.match(patron);
                    // Extraer el contenido dentro de los corchetes
                    let contenidoCorchetes = resultado.map(match => match.replace(/^\[|\]$/g, ''));
                    var nuevo_CodigoAreas = `${producto}[${contenidoCorchetes[0] + bodegaNueva + ";" + areaNueva + ";"}]`
                    

                    peticion = 
                    `UPDATE Codigo_Areas SET codigo_Areas = ? WHERE Producto = ?`;
                    
                    db.run(peticion,[nuevo_CodigoAreas, producto], (err)=>{
                        if(err){
                            return reject(err);
                        }resolve();
                        resolveMacro();
                    });
                    setTimeout(()=>{
                        reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
                    }, 2000)    
                });
            } catch (error) {
                reject(error)
            }
        });

        //Termaniar la tansaccion en caso de exito
        await new Promise((resolve, reject)=>{
            db.run('COMMIT', (err)=>{
                if(err){
                    return reject(err);
                }resolve();
            });
            setTimeout(()=>{
                console.log("COMMIT");
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