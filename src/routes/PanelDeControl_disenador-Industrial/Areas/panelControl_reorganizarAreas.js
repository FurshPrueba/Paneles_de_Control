const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');
//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_disenador-Industrial/reorganizarArea', async(req, res)=>{

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

        var reorderableItems = req.body.reorderableItems;

        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigo_Codigo_Areas = await new Promise((resolve, reject)=>{
            var contenidoCodigo = "";

            reorderableItems.split(";").forEach(area => {
                contenidoCodigo = `${contenidoCodigo}B${area.match(/\d+/g)[0]};${area};`
            });
            var nuevo_Codigo = `P1[A0;${contenidoCodigo}]`;
            resolve(nuevo_Codigo);
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 8000)
        });

        //Actualizar el codigo del orden de las imagenes
        
        await new Promise((resolve, reject)=>{
            var peticion = 'UPDATE Codigo_Areas SET codigo_Areas = ? WHERE Producto = ?';
            
            db.run(peticion,[nuevoCodigo_Codigo_Areas, "P1"], (err)=>{
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