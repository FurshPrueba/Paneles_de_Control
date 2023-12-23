const  express = require('express');
const multer = require('multer');
const  body_parser = require('body-parser');
const  colors = require('colors');
const upload = multer();
//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_disenador-Industrial/agregarImagen',upload.single('BlobCortado') , async(req, res)=>{

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

        //Manipular los datos para agregar

        var Area = req.body.area;
        var TiempoEstimadoPaso =  req.body.timepoEstimado;

        var peticion;
        var NumeroImagenesMismaArea = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM ImagenesAreas WHERE areaID = ?';
            db.all(peticion, [Area], (err, rowImagen)=>{
                if(err){
                    return reject(err);
                }
                resolve(rowImagen.length)
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 3000)
        });

        var codigo_Imagenes = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM codigo_Imagenes WHERE areaID = ?';
            db.all(peticion, [Area], (err, rowImagen)=>{
                if(err){
                    return reject(err);
                }
                resolve(rowImagen)
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 3000)
        });
        
        var idImagenNueva = `${NumeroImagenesMismaArea + 1}-${req.body.area}`
        
        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigo_Imagenes = await new Promise((resolve, reject)=>{
            var codigo_Actual_Imagenes = codigo_Imagenes[0].codigo_ordenImagenes;
            var LineaDeImagenes = codigo_Actual_Imagenes.match(/\[[^\]]+\]/g);
            console.log(req.body.IDimagenAnterior);
            
            LineaDeImagenes.forEach((lineaImagenes) => {
                var contenidoCodigo_Imagenes = lineaImagenes.replace(/\[|\]/g, '');
                var coincidenciasImagenesCodigo_Imagenes = contenidoCodigo_Imagenes.split(';')
                //
                var parteAnterior_Codigo_Imagenes;
                var partePosterior_Codigo_Imagenes;
                
                var nuevo_Codigo_Imagenes;
                //
                coincidenciasImagenesCodigo_Imagenes.forEach((imagen, indice)=>{
                    var imagen = imagen.trim();
                    if(imagen !== ''){
                        if(imagen == req.body.IDimagenAnterior){
                            parteAnterior_Codigo_Imagenes = codigo_Actual_Imagenes.split(imagen)[0] + imagen + ";";
                            partePosterior_Codigo_Imagenes = codigo_Actual_Imagenes.split(imagen)[1];
                            //Establecer el nuevo codigo de las imagenes
                            nuevo_Codigo_Imagenes = `${parteAnterior_Codigo_Imagenes}${idImagenNueva}${partePosterior_Codigo_Imagenes}`
                            resolve(nuevo_Codigo_Imagenes);
                        }
                    }
                });

                return false;
            });
            
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 8000)
        });

        
        //Actualizar el codigo del orden de las imagenes
        
        await new Promise((resolve, reject)=>{
            var peticion = 'UPDATE Codigo_Imagenes SET codigo_ordenImagenes = ? WHERE areaID = ?';
            
            db.run(peticion,[nuevoCodigo_Imagenes, req.body.area], (err)=>{
                if(err){
                    return reject(err);
                }resolve();
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });
        
        

        //Actualizar los datos en caso de que todo halla salido bien
        await new Promise((resolve, reject)=>{
            var areaNuevaImagen = req.body.area;
            var descripcion_nombreNuevaImagen = req.body.nombreImagen;
            var BLOBNuevaImagen = req.file.buffer; 

            var peticion = 
            `INSERT INTO ImagenesAreas (imagenID ,areaID, nombre_Imagen, imagenEncriptada, TiempoEstimadoPaso)
            VALUES (?, ?, ?, ?, ?)`;
            
            db.run(peticion,[idImagenNueva, areaNuevaImagen, descripcion_nombreNuevaImagen, BLOBNuevaImagen, TiempoEstimadoPaso], (err)=>{
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