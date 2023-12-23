const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');
//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_Disenador-Industrial/borrarImagen', async(req, res)=>{

    const db = require('../../../dblinea_de_produccion.js');
    try{
        //Iniciar una transaccion para p guardar los datos en la base de datos (es una base de datos sqlite 3, empezar una transaccion)
        await new Promise((resolve, reject)=>{
            db.run('BEGIN TRANSACTION', (err, row)=>{
                if(err){
                    return reject(err);
                }resolve();
            });
        });

        var Area = req.body.Area;
        var imagenABorrarID = req.body.imagenBorrada;
        var numeroImagenAEliminar = parseInt(imagenABorrarID.split("-")[0]);
    

        var imagenesDelArea = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM ImagenesAreas WHERE areaID = ?';
            db.all(peticion, [Area], (err, rowImagen)=>{
                if(err){
                    return reject(err);
                }
                resolve(rowImagen);
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 1500)
        });
        var anteriorCodigoImagenes = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM Codigo_Imagenes WHERE areaID = ?';
            db.all(peticion, [Area], (err, rowImagen)=>{
                if(err){
                    return reject(err);
                }
                resolve(rowImagen[0].codigo_ordenImagenes);
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 1500)
        });
        //var numeroImagenABorrar = imagenABorrarID.split("-")[0];

        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigo_Codigo_Imagenes = await new Promise((resolve, reject)=>{       
            var nuevo_Codigo = "";
            
            var LineaDeimagenes = anteriorCodigoImagenes.match(/\[[^\]]+\]/g);    
            // Dividir por cada línea de imagenes en el codigo

            LineaDeimagenes.forEach((lineaImagenes) => {
                var contenidoCodigoImagenes = lineaImagenes.replace(/\[|\]/g, '');
                
                var listaImagenes = contenidoCodigoImagenes.split(";");

                listaImagenes.forEach((codigoImagen, indice)=>{
                    if(codigoImagen.trim() !== ""){
                        var partesID = codigoImagen.split("-");
                        var numeroImagenIterada = parseInt(partesID[0]);
                        
                        if(numeroImagenIterada == numeroImagenAEliminar){
                        }else if(numeroImagenIterada > numeroImagenAEliminar){
                            var codigoImagenModificado =  `${numeroImagenIterada - 1}-${partesID[1]}` ;
                            nuevo_Codigo = nuevo_Codigo + codigoImagenModificado  + ";";
                        }else{
                            nuevo_Codigo = nuevo_Codigo + codigoImagen + ";";
                        }
                    }
                })

            })

            nuevo_Codigo = `${Area[0]}:${Area.match(/\d+/g)}[${nuevo_Codigo}]`

            resolve(nuevo_Codigo);
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 8000)
        });
        
        
        //Borrar la imagen de la base de datos
        
        await new Promise((resolve, reject)=>{            
            var peticion = 'DELETE FROM ImagenesAreas WHERE imagenID = ?';
            
            db.run(peticion,[imagenABorrarID], (err)=>{
                if(err){
                    return reject(err);
                }resolve();   
            });

            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });
        
        //Actualizar las imagenes posteriores a la eliminada, acomodando sus IDs
        await new Promise(async (resolve, reject) => {
            let indice = 0;
        
            async function actualizarSiguienteImagen() {
                if (indice < imagenesDelArea.length) {
                    const imagen = imagenesDelArea[indice];
                    const partesID = imagen.imagenID.split("-");
                    const numeroImagenIterada = parseInt(partesID[0]);
        
                    if (numeroImagenIterada > numeroImagenAEliminar) {
                        const IDImagenModificado = `${numeroImagenIterada - 1}-${partesID[1]}`;
        
                        try {
                            const checkExistingQuery = 'SELECT imagenID FROM ImagenesAreas WHERE imagenID = ? LIMIT 1';
                            const existingResult = await db.get(checkExistingQuery, [IDImagenModificado]);
        
                            if (!existingResult || Object.keys(existingResult).length === 0) {
                                const updateQuery = 'UPDATE ImagenesAreas SET imagenID = ? WHERE imagenID = ?';
                                await new Promise((resolve, reject)=>{
                                    db.run(updateQuery, [IDImagenModificado, imagen.imagenID], (err)=>{
                                        if(err){
                                            reject(err);
                                        }else{
                                            resolve();
                                        }
                                    });
                                })
                            } else {
                                console.log(`El ID ${IDImagenModificado} ya existe en la base de datos.`);
        
                                let newID = `${parseInt(partesID[0])}-${partesID[1]}`;
                                let counter = 1;
                                while (true) {
                                    newID = `${parseInt(partesID[0]) + counter}-${partesID[1]}`;
                                    const checkNewIDQuery = 'SELECT imagenID FROM ImagenesAreas WHERE imagenID = ?';
                                    const result = await db.get(checkNewIDQuery, [newID]);
                                    if (!result || Object.keys(result).length === 0) {
                                        console.log(`Nuevo ID disponible: ${newID}`);
                                        const updateQuery = 'UPDATE ImagenesAreas SET imagenID = ? WHERE imagenID = ?';
                                        await db.run(updateQuery, [newID, imagen.imagenID]);
                                        break;
                                    }
                                    counter++;
                                }
                            }
                        } catch (error) {
                            return reject(error);
                        }
                    }
        
                    indice++;
                    return actualizarSiguienteImagen();
                } else {
                    return resolve();
                }
            }
        
            actualizarSiguienteImagen();
        });

        //Actualizar el codigo de el orden de las imagenes

        await new Promise((resolve, reject)=>{
            var peticion = 'UPDATE Codigo_Imagenes SET codigo_ordenImagenes = ? WHERE areaID = ?';
            
            db.run(peticion,[nuevoCodigo_Codigo_Imagenes, Area], (err)=>{
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