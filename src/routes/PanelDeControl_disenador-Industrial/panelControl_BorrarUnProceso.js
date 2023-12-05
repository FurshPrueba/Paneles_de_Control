const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');

//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_diseñador-Industrial/borrarProceso', async(req, res)=>{

    const db = require('../../dblinea_de_produccion.js');
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
        var peticion;
        var lineaProduccion = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM Productos WHERE productosID = ?';
            db.get(peticion, [req.body.IdProductoActual], (err, lineaProduccion)=>{
                if(err){
                    return reject(err);
                }
                resolve(lineaProduccion)
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 1500)
        });

        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigoLecturaProcesos = await new Promise((resolve, reject)=>{
            //Diferenciar cada uno de los macroprocesos contribullentes en la linea de produccion

            var LineaDeProcesos = lineaProduccion.codigoLectura.match(/\[[^\]]+\]/g);

            // Dividir por cada línea de proceso individual
        
            LineaDeProcesos.forEach((lineaProcesos) => {
        
                var contenidoCodigoLectura = lineaProcesos.replace(/\[|\]/g, '');
                // Dividir por cada PROCESO
                var nuevoCodigoLecturaProcesos; //En esta variable se va a guardar el nuevo codigo de vista

                //Partes de el nuevo codigo
                    //Parte inferior del codigo (el codigo pasado a la creacion de un nuevo proceso, lo que tiene por conciquiente )
                var ParteAnteriorCodigoLectura;
                var siguienteProceso = '';
                var PartePosteriorCodigoLectura;
                var cantidadEliminados = 0;
                var procesoSiguienteElminado = false;
                var hayProcesoSiguiente = true;
                contenidoCodigoLectura.split(';').forEach((proceso, indice)=>{
                    var proceso = proceso.trim();
                    if(proceso !== ''){
                        var idProceso = parseInt(proceso.split(':')[1].replace(/\((.*?)\)/, '').replace(';', ''));
                        var idProcesoAEliminar = parseInt(req.body.IdProcesoActual);


                        //Funcion crear un proceso (se utilizara para crear los procesos)
//Funcion crear un proceso (se utilizara para crear los procesos)

                        function crearCodigoProceso(proceso,tipoProceso,IdProceso , areasProceso, numeroReemplasos){
                            //Crear las partes del proceso
                            var reemplasoCasoAnulado = proceso.match(/\{[^}]*\}(?:\})*/g);
                            
                            if(reemplasoCasoAnulado !== null){
                                numeroReemplasos++ //Subirle a la cantidad de reemplasos que tiene el proceso
                                reemplasoCasoAnulado = reemplasoCasoAnulado[0].slice(1, -1);
                                if(tipoProceso == 'B-A-NR'){
                                    var tipoProcesoReemplaso = tipoProceso; //ejemplo NR (no realizado) o R (realizado)
                                }else{
                                    var tipoProcesoReemplaso = reemplasoCasoAnulado.split(':')[0]; //ejemplo NR (no realizado) o R (realizado)
                                }
                                var areasProcesoReemplaso = [areasProceso[0] , reemplasoCasoAnulado.match(/\((.*?)\)/)[1].split(',')[1]];
                                if(numeroReemplasos == 1){
                                    var proceso = `${tipoProceso}:${IdProceso}(${areasProceso[0]},${areasProceso[1]}){${crearCodigoProceso(reemplasoCasoAnulado, tipoProcesoReemplaso, IdProceso, areasProcesoReemplaso, numeroReemplasos)}}`;
                                }else{
                                    var proceso = `${tipoProceso}:${IdProceso}-${numeroReemplasos - 1}(${areasProceso[0]},${areasProceso[1]}){${crearCodigoProceso(reemplasoCasoAnulado, tipoProcesoReemplaso, IdProceso, areasProcesoReemplaso, numeroReemplasos)}}`;
                                }
                                return proceso;
                            }else{
                                numeroReemplasos++ //Subirle a la cantidad de reemplasos que tiene el proceso
                                if(numeroReemplasos == 1){
                                    var proceso = `${tipoProceso}:${IdProceso}(${areasProceso[0]},${areasProceso[1]})`;
                                }else{
                                    var proceso = `${tipoProceso}:${IdProceso}-${numeroReemplasos - 1}(${areasProceso[0]},${areasProceso[1]})`;
                                }
                                return proceso;
                            }
                        }

                        var tipoProceso = proceso.split(':')[0].trim(); //ejemplo NR (no realizado) o R (realizado)
                        var numeroReemplasos = 0;
                        if(tipoProceso  == 'B-NR'){
                            cantidadEliminados++
                        }

                        console.log()
                        if(idProceso == idProcesoAEliminar && tipoProceso !== 'B-NR' && tipoProceso !== 'B-A-NR'){ //Si el proceso acutal iterado es el proceso del  que vino el nuevo proceso
                            var areasSiguienteProceso = proceso.match(/\((.*?)\)/)[1].split(','); //Areas de el proceso a borrar
                            tipoProceso = 'B-' + tipoProceso; //ejemplo NR (no realizado) o R (realizado)
                            var procesoEliminado = 
                            crearCodigoProceso(proceso, tipoProceso, idProcesoAEliminar, areasSiguienteProceso, numeroReemplasos) + ';';

                            var ParteAnteriorCodigoArry = contenidoCodigoLectura.split(proceso);
                            if(ParteAnteriorCodigoArry.length > 2){
                                ParteAnteriorCodigoArry.forEach((parteAnterior, indice)=>{
                                    if(indice <= ParteAnteriorCodigoArry.length - 2){
                                        ParteAnteriorCodigoLectura = 
                                        (ParteAnteriorCodigoLectura + parteAnterior + proceso + ';')
                                            .replace('undefined', '')
                                            .replace(/;;/g, ';')
                                            .replace(new RegExp(";NR:" + idProcesoAEliminar, "g") , `;B-NR:${idProcesoAEliminar}`);
                                    }
                                });
                                // ParteAnteriorCodigoLectura = `${ParteAnteriorCodigoLectura[ParteAnteriorCodigoLectura.length - 2]}${procesoEliminado}`; // resulta en la parte anterior (que no se modifica)  del codigoLectura
                            }else{
                                ParteAnteriorCodigoLectura = `${contenidoCodigoLectura.split(proceso)[0]}${procesoEliminado}`; // resulta en la parte anterior (que no se modifica)  del codigoLectura
                            }
                            procesoSiguienteElminado = true;
                        }else if(procesoSiguienteElminado){ //Si es el siguiente proceso                            
                            //Se recrea el siguiente proceso para que coincida con el que se creara en tre el porseso del que vino con el siguiente
                            if(tipoProceso == 'B-NR' || tipoProceso == 'B-A-NR'){
                                //Crear las partes del proceso
                                var areasSiguienteProceso = proceso.match(/\((.*?)\)/)[1].split(',');
                                ParteAnteriorCodigoLectura = ParteAnteriorCodigoLectura + crearCodigoProceso(proceso, tipoProceso, idProcesoAEliminar, areasSiguienteProceso, numeroReemplasos) + ';';    
                            }else{
                                //Crear las partes del proceso
                                var areasSiguienteProceso = [req.body.direccionalidadConectorPadreInicial, proceso.match(/\((.*?)\)/)[1].split(',')[1]];
                                if(areasSiguienteProceso[0] == areasSiguienteProceso[1]){//Si el proceso empieza en el mismo lugar que al que llga entonces..
                                    procesoSiguienteElminado = true; 
                                    //Que siga callendo en este bucle hasta que encuentre un proceso que no quede con
                                    //Estas mismas areas (repetidas en salida y entrada)
                                    siguienteProceso = '';
                                    hayProcesoSiguiente = false;
                                                                    //Crear las partes del proceso
                                var areasSiguienteProceso = proceso.match(/\((.*?)\)/)[1].split(',');
                                tipoProceso = 'B-' + tipoProceso;
                                ParteAnteriorCodigoLectura = 
                                ParteAnteriorCodigoLectura + crearCodigoProceso(proceso, tipoProceso, idProcesoAEliminar, areasSiguienteProceso, numeroReemplasos) + ';'; 
                                }else{ //Si no entonces...
                                    procesoSiguienteElminado = false;
                                    siguienteProceso = crearCodigoProceso(proceso, tipoProceso, idProcesoAEliminar, areasSiguienteProceso, numeroReemplasos) + ';';
                                }
                            }
                        }else if(idProcesoAEliminar + 1 <= idProceso){ //Establecer los procesos siguientes (los que van despues del siguiente en la linea)
                            //Reestablezer el Id de los procesos posteriores
    
                                //Crear las partes del proceso
                            var areasSiguienteProceso = proceso.match(/\((.*?)\)/)[1].split(',');  
                            var idProcesosSiguientes;
                            if(hayProcesoSiguiente){
                                idProcesosSiguientes = idProceso - 1;
                            }else{
                                idProcesosSiguientes = idProceso - 2;
                            }                        
                            var proceso = crearCodigoProceso(proceso, tipoProceso, idProcesosSiguientes, areasSiguienteProceso, numeroReemplasos);

                            //Este es el codigo Posterior al siguiente en la linea
                            PartePosteriorCodigoLectura  = (PartePosteriorCodigoLectura + `${proceso};`).replace('undefined', '');
                        }
                        if(contenidoCodigoLectura.split(';').length == indice + 2){ //Cuando ya termino de procesar cada proceso, ahora reunira las partes del codigo y lo reconstruira (se manda respuesta)
                            nuevoCodigoLecturaProcesos = (`#[${ParteAnteriorCodigoLectura}${siguienteProceso}${PartePosteriorCodigoLectura}]`).replace('undefined', '').replace(/ /g, '');
                            console.log(nuevoCodigoLecturaProcesos.green);
                            resolve(nuevoCodigoLecturaProcesos);
                        }
                    }
                });

                return false;
            });

            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });
        
        //Actualizar los datos en caso de que todo halla salido bien
        await new Promise((resolve, reject)=>{
            var peticion = 'UPDATE Productos SET codigoLectura = ? WHERE productosID = ?';
            
            db.run(peticion,[nuevoCodigoLecturaProcesos, req.body.IdProductoActual], (err)=>{
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

        res.json({contenido: nuevoCodigoLecturaProcesos});
    }catch (err){
        console.log('Error en el procedimiento: ', err);
        res.json({respuesta: err})
        //Termaniar la tansaccion y volver al caso anterior
        db.run('ROLLBACK');
    }
});

module.exports = rutas;