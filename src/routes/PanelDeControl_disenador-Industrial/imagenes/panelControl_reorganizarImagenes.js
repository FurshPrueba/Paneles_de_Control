const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');
//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_Disenador-Industrial/reorganizarImagenes', async(req, res)=>{

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

        var Area = req.body.area;
        var reorderableItems = req.body.reorderableItems;

        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigo_Codigo_Imagenes = await new Promise((resolve, reject)=>{
            var idNumeroArea = Area.match(/\d+/g);
            var nuevo_Codigo = `${Area[0]}:${idNumeroArea}[0-${Area};${reorderableItems};]`;
            resolve(nuevo_Codigo);
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 8000)
        });

        
        //Actualizar el codigo del orden de las imagenes
        
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