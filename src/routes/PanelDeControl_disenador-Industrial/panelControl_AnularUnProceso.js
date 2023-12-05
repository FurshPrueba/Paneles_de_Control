const  express = require('express');
const  body_parser = require('body-parser');
const  colors = require('colors');

//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_diseñador-Industrial/anularProceso', async(req, res)=>{
    const db = require('../../dblinea_de_produccion.js');
    try{
        //Iniciar una transaccion para p guardar los datos en la base de datos (es una base de datos sqlite 3, empezar una transaccion)
        await new Promise((resolve, reject)=>{
            db.run('BEGIN TRANSACTION', (err, row)=>{
                if(err){
                    return reject(err);
                }resolve();
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });

        //Manipular los datos para agregar
        var peticion;
        var productoAActualizar = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM Productos WHERE productosID = ?';
            db.get(peticion, [req.body.IdProductoActual], (err, rowProductoAActualizar)=>{
                if(err){
                    return reject(err);
                }
                resolve(rowProductoAActualizar)
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 2000)
        });

        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigoLecturaProcesos = await new Promise((resolve, reject)=>{
            //Diferenciar cada uno de los macroprocesos contribullentes en la linea de produccion

            var LineaDeProcesos = productoAActualizar.codigoLectura.match(/\[[^\]]+\]/g);

    
            // Dividir por cada línea de proceso individual
        
            LineaDeProcesos.forEach((lineaProcesos) => {
        
                var contenidoCodigoLectura = lineaProcesos.replace(/\[|\]/g, '');
                // Dividir por cada PROCESO                
                const regex = /NR:\d+(\.\d+)?(-\d+)?\([^)]*\)/g;
                const coincidenciasProcesosCodigoLectura = contenidoCodigoLectura.match(regex);

                var nuevoCodigoLecturaProcesos; //En esta variable se va a guardar el nuevo codigo de vista
                var procesoSiquiente = '';
                var actualizacionProcesoAnulado;  //En esta variable se va a alojar el procesos que se actualizara (se le agregara un nuevo subproceso)
                var procesosAnteriores; //En esta variable se estableceran los procesos pasados del proceso anulado
                var procesosPosteriores; //En esta variable se estableceran los procesos futuros del proceso anulado
                var indiceProceso = false; //Solo para que despues de la primera itaracion (la que establece el contenido de el proceso anulado) se guarde dicha informacion
                var cantidadEliminados = 0;
                var cantidadDeProcesos = 0;
                var coincidenciIteracionPorProcesos= contenidoCodigoLectura.split(';');

                //Iteracion para poder encontar la cantidad de procesos y procesos eliminados
                coincidenciIteracionPorProcesos.forEach((proceso)=>{
                    if(proceso !== ''){ 
                        var tipoProceso = proceso.split(':')[0].trim(); //ejemplo NR (no realizado) o R (realizado)
                        if(tipoProceso  == 'B-NR' || tipoProceso == 'B-A-NR'){
                            cantidadEliminados++
                        }else{
                            cantidadDeProcesos++
                        }
                    }
                });
                            /* ITERACION CON LA LINEA DE PRODUCCIOn */
                coincidenciasProcesosCodigoLectura.forEach((proceso, indice) => { //En este momento se itera para tener a mano todos los procesos que se requiran en la linea de produccion
                    var proceso = proceso.trim();
                    if(proceso !== ''){ 
                        var IdProceso = proceso.replace(/\([^)]*\)/, '').replace(/\(\((.*?)\)\)/, '').split(':')[1].trim(); //Este es el Id del proceso que se esta iterando (actual)
                        var idProcesoACambiar = req.body.IdProcesoActual; //Este es el proceso que va a ser actualizado (viene de la solicitud)

                        //Este es un codigo diseccionado por cada uno de los procesos que lo conforman

                        //Decidir el contenido del if (para diferenciar entre el calculo matematico con las desimales y sin decimales de los subprocesos y procesos)
                        
                        var tipoProceso = proceso.split(':')[0].trim(); //ejemplo NR (no realizado) o R (realizado)
                        var numeroReemplasos = 0;


                        //FUNCION = Esta funcion se empleara para crear procesos (todos los procesos siguientes a la actualizacion del procesos anulado)
                        function crearCodigoProceso(proceso,tipoProceso,IdProceso , areasProceso, numeroReemplasos){
                            //Crear las partes del proceso
                            var reemplasoCasoAnulado = proceso.match(/\{[^}]*\}(?:\})*/g);
                            
                            if(reemplasoCasoAnulado !== null){
                                numeroReemplasos++ //Subirle a la cantidad de reemplasos que tiene el proceso
                                reemplasoCasoAnulado = reemplasoCasoAnulado[0].slice(1, -1);
                                var tipoProcesoReemplaso = reemplasoCasoAnulado.split(':')[0]; //ejemplo NR (no realizado) o R (realizado)
                                var areasProcesoReemplaso = [areasProceso[0] , reemplasoCasoAnulado.match(/\((.*?)\)/)[1].split(',')[1]];
                                if(numeroReemplasos == 1){
                                    var proceso = `A-NR:${IdProceso}(${areasProceso[0]},${areasProceso[1]}){${crearCodigoProceso(reemplasoCasoAnulado, tipoProcesoReemplaso, IdProceso, areasProcesoReemplaso, numeroReemplasos)}}`;
                                }else{
                                    var proceso = `A-NR:${IdProceso}-${numeroReemplasos - 1}(${areasProceso[0]},${areasProceso[1]}){${crearCodigoProceso(reemplasoCasoAnulado, tipoProcesoReemplaso, IdProceso, areasProcesoReemplaso, numeroReemplasos)}}`;
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

                        //Si... El processo iterado es el mismo que el proceso que se va a actualizar entonces...
                        if(idProcesoACambiar == IdProceso){
                            /*
                                *Se va a realizar la segunda iteracion por que se nececia interactuar con los procesos
                                *demostrados por su ID, los cuales son solo reconocibles por una itaracion mas general
                            */
                            coincidenciIteracionPorProcesos.forEach((procesoSegundaIteracion, indice)=>{ //Se itera por cada proceso
                                if(procesoSegundaIteracion !== ''){
                                    var tipoProcesoIterado = procesoSegundaIteracion.split(':')[0].trim(); //ejemplo NR (no realizado) o R (realizado)
                                    var IdProcesoIterado = procesoSegundaIteracion.split(':')[1].trim().split('(')[0].trim(); //Este es el Id del proceso que se esta iterando (actual)
                                    if(IdProcesoIterado == idProcesoACambiar.split('-')[0] && tipoProcesoIterado !== 'B-NR' && tipoProcesoIterado !== 'B-A-NR'){
                                        procesosAnteriores = '';
                                        function numeroProcesoAnulados(procesoSegundaIteracion, numeroProceso){
                                            //Crear las partes del proceso
                                            var reemplasoCasoAnulado = procesoSegundaIteracion.match(/\{[^}]*\}(?:\})*/g);
                                            if(reemplasoCasoAnulado !== null){   //Iterar hasta encontrar la cantidad de anulados             
                                                return numeroProcesoAnulados(reemplasoCasoAnulado[0].slice(1, -1), numeroProceso + 1);
                                            }else{
                                                //Cuando se itero hasta llegar al final de las anulaciones, entonces
                                                return numeroProceso;
                                            }
                                        }
                                        var numeroProceso = numeroProcesoAnulados(procesoSegundaIteracion, 0);     
                                        //Despues de tener el numerador de los anulados, plasmar el siguiente y seguir operando
                                        indiceProceso = true;
                                        areasProcesoActializado = [req.body.direccionalidadConectorHijoInicio, req.body.direccionalidadConectorHijoFinal];
                                        //ESte es el proceso actualizado (que se anulo)\
                                        actualizacionProcesoAnulado = 
                                        `A-${proceso}{NR:${IdProceso.split('-')[0]}-${numeroProceso + 1}(${areasProcesoActializado[0]},${areasProcesoActializado[1]})}`;

                                        //crearCodigoProceso(procesoSegundaIteracion,'NR',`${IdProceso.split('-')[0]}` , areasProcesoActializado, numeroReemplasos);
                                        procesoOriginal = proceso;
                                        nuevoCodigoLecturaProcesos = contenidoCodigoLectura.split(proceso +';');
                                        //Esta es la recapitulacion de procesos despues de  el actualizado
                                        
                                        var ParteAnteriorCodigoArry = contenidoCodigoLectura.split(proceso);
                                        
                                        procesosPosteriores = contenidoCodigoLectura.split(proceso)[ParteAnteriorCodigoArry.length - 1];
                                        //Si el proceso (Tal cual) esta repetido en la linea entonces va a elegir el mas lejano de todos()
                                        
                                        console.log(ParteAnteriorCodigoArry);
                                        if(ParteAnteriorCodigoArry.length > 2){
                                            ParteAnteriorCodigoArry.forEach((parteAnterior, indice)=>{
                                                if(parteAnterior.endsWith('B-A-') || parteAnterior.endsWith('A-')|| parteAnterior.endsWith('B-') || parteAnterior.endsWith('};')){
                                                    if(indice <= ParteAnteriorCodigoArry.length - 2){
                                                        let procesoImprimir = proceso;
                                                        if(indice == ParteAnteriorCodigoArry.length - 2){
                                                            procesoImprimir = '';
                                                        }
                                                        
                                                        procesosAnteriores = 
                                                        (procesosAnteriores + parteAnterior + procesoImprimir + ';')
                                                        .replace('undefined', '') //Filtro para quitarle los datos no definidos (al principio)
                                                        .replace(/;;/g, ';') //Evitar redundancia al declarar dos separadores de procesos
                                                        .replace(/\);\{/g, '){') //Quitar separadores de procesos entre el anulado y su reemplaso
                                                        .replace(new RegExp(";NR:" + idProcesoACambiar, "g") , `;A-NR:${idProcesoACambiar}`);
                                                        console.log(indice);
                                                        console.log(parteAnterior.bgRed);
                                                        console.log(procesosAnteriores.america);
                                                        console.log(proceso);
                                                    }
                                                    
                                                }
                                            });
                                            // ParteAnteriorCodigoLectura = `${ParteAnteriorCodigoLectura[ParteAnteriorCodigoLectura.length - 2]}${procesoEliminado}`; // resulta en la parte anterior (que no se modifica)  del codigoLectura
                                        }else{
                                            procesosAnteriores = `${contenidoCodigoLectura.split(proceso)[0]}`; // resulta en la parte anterior (que no se modifica)  del codigoLectura
                                        }
                                        return {nuevoCodigoLecturaProcesos, actualizacionProcesoAnulado, procesosAnteriores};
                                    }
                                }
                            });
                        }else if(indiceProceso){
                            indiceProceso = false; //despues de iterar y llegar al siguiente, se cancela para que no se vuelva a procesar('quiubo :)')
                            var mitadProcesosPosterores;

                            contenidoCodigoLectura.split(';').forEach((procesoSegundaIteracion)=>{
                                if(procesoSegundaIteracion !== ''){
                                    var IdProcesoIterado = procesoSegundaIteracion.split(':')[1].trim().split('(')[0].trim(); //Este es el Id del proceso que se esta iterando (actual)
                        
                                    if(IdProcesoIterado == IdProceso){
                                        mitadProcesosPosterores = procesosPosteriores.split(procesoSegundaIteracion)[0];
                                        procesosPosteriores = procesosPosteriores.split(procesoSegundaIteracion)[1];

                                        var areasProcesoPosterior = proceso.match(/\(([^)]+)\)/)[1].split(',');
                                        procesoSiquiente = crearCodigoProceso(procesoSegundaIteracion,tipoProceso, IdProcesoIterado,[req.body.direccionalidadConectorHijoFinal, areasProcesoPosterior[1]], numeroReemplasos);
                                    }
                                }
                            });
                            //`NR:${IdProceso}(${req.body.direccionalidadConectorHijoFinal.trim()},${areasProcesoPosterior[1].trim()})`; //En esta linea esta el siquiente procesi (sequir la continuidad);

                            var codigoLecturaActualizado = 
                            (`#[${procesosAnteriores}${actualizacionProcesoAnulado}${mitadProcesosPosterores}${procesoSiquiente} ${procesosPosteriores}]`)
                                .replace('undefined', '')
                                .replace(/ /g, '');
                            
                            resolve(codigoLecturaActualizado);
                        }   

                        if(indiceProceso && idProcesoACambiar.split('-')[0] == cantidadDeProcesos && coincidenciasProcesosCodigoLectura.length ==  indice + 1){
                            var codigoLecturaActualizado = 
                            (`#[${procesosAnteriores}${actualizacionProcesoAnulado}${procesosPosteriores}]`)
                            .replace('undefined', '')
                            .replace(/ /g, '');
                            //Enviar el nuevo codigo Completo
                            console.log(codigoLecturaActualizado.green);

                            resolve(codigoLecturaActualizado);
                        }
                    }
                });
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 4000)
        });

        //Actualizar los datos en caso de que todo halla salido bien
        await new Promise((resolve, reject)=>{
            var peticion = 'UPDATE Productos SET codigoLectura = ? WHERE productosID = ?';
            console.log('ACTUALIZANDO EL CODIGO'.bgRed);
            console.log(nuevoCodigoLecturaProcesos.bgCyan);
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
            res.json({tipoRespuesta: 'procesoProsesadoEfectivamente'}); //Respuesta positiva del servidor (se proceso de manera correcta)
        });

    }catch (err){
        console.log('Error en el procedimiento: ', err);
        res.json({tipoRespuesta: 'Tiempo Exedido'});

        //Termaniar la tansaccion y volver al caso anterior
        db.run('ROLLBACK');
    }
});

module.exports = rutas;