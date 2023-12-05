const  express = require('express');
const multer = require('multer');
const  body_parser = require('body-parser');
const  colors = require('colors');
const upload = multer();
//Establecer las rutas de inicio
const rutas = express.Router();



//Aceptar y crear un nuevo proceso

rutas.post('/PanelDeControl_disenador-Industrial/agregarImagen',upload.single('BlobCortado') , async(req, res)=>{

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
        var NumeroImagenesMismaArea = await new Promise((resolve, reject)=>{
            peticion = 'SELECT * FROM ImagenesAreas WHERE areaID = ?';
            db.all(peticion, [req.body.area], (err, rowImagen)=>{
                if(err){
                    return reject(err);
                }
                resolve(rowImagen.length)
            });
            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 1500)
        });
        

        /*
        //actualizar el contenido de la columna codigoLectura en el producto actual (el producto que se esta actualizando)
        var nuevoCodigoLecturaProcesos = await new Promise((resolve, reject)=>{
            //Diferenciar cada uno de los macroprocesos contribullentes en la linea de produccion

            var LineaDeProcesos = productoAActualizar.codigoLectura.match(/\[[^\]]+\]/g);

    
            // Dividir por cada línea de proceso individual
        
            LineaDeProcesos.forEach((lineaProcesos) => {
        
                var contenidoCodigoLectura = lineaProcesos.replace(/\[|\]/g, '');
                // Dividir por cada PROCESO
                var nuevoCodigoLecturaProcesos; //En esta variable se va a guardar el nuevo codigo de vista

                //Partes de el nuevo codigo
                    //Parte inferior del codigo (el codigo pasado a la creacion de un nuevo proceso, lo que tiene por conciquiente )
                var ParteAnteriorCodigoLectura;
                var nuevoProceso;
                var siguienteProceso = '';
                var PartePosteriorCodigoLectura = '';
                var cantidadEliminados = 0;
                var procesoSiguienteAgregado = false;
                var coincidenciasProcesosCodigoLectura = contenidoCodigoLectura.split(';')
                coincidenciasProcesosCodigoLectura.forEach((proceso, indice)=>{
                    if(proceso !== ''){
                        var idProceso = parseInt(proceso.split(':')[1].replace(/\((.*?)\)/, '').replace(';', ''));
                        var idProcesoAAgregar = parseInt(req.body.IdProcesoActual);

                        //Funcion crear un proceso (se utilizara para crear los procesos)

                        function crearCodigoProceso(proceso,tipoProceso,IdProceso , areasProceso, numeroReemplasos){
                            //Crear las partes del proceso
                            
                            if(reemplasoCasoAnulado !== null){
                                numeroReemplasos++ //Subirle a la cantidad de reemplasos que tiene el proceso
                                reemplasoCasoAnulado = reemplasoCasoAnulado[0].slice(1, -1);
                                var tipoProcesoReemplaso = reemplasoCasoAnulado.split(':')[0]; //ejemplo NR (no realizado) o R (realizado)
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

                        nuevoProceso = `NR:${idProcesoAAgregar + 1}(${req.body.direccionalidadConectorHijoInicio}, ${req.body.direccionalidadConectorHijoFinal});`;
                        
                        //Partes del proceso iterado
                        var tipoProceso = proceso.split(':')[0].trim(); //ejemplo NR (no realizado) o R (realizado)
                        var numeroReemplasos = 0;



                        if(tipoProceso  == 'B-NR'){
                            cantidadEliminados++
                        }
                            //Si es el proceso esperado entonces...
                        if(idProceso == idProcesoAAgregar && tipoProceso !== 'B-NR' && tipoProceso !== 'B-A-NR'){ //Si el proceso acutal iterado es el proceso del  que vino el nuevo proceso
                            var partesAnteriores = contenidoCodigoLectura.split(proceso);
                            console.log(partesAnteriores);
                            if(partesAnteriores.length > 2){
                                partesAnteriores.forEach((parteAnterior, indice)=>{
                                    if(parteAnterior.endsWith('B-A-') || parteAnterior.endsWith('A-') || parteAnterior.endsWith('B-') || parteAnterior.endsWith('};')){
                                        if(indice <= partesAnteriores.length - 2){
                                            ParteAnteriorCodigoLectura = 
                                            (ParteAnteriorCodigoLectura + parteAnterior + proceso + ';')
                                            .replace('undefined', '') //Filtro para quitarle los datos no definidos (al principio)
                                            .replace(/;;/g, ';') //Evitar redundancia al declarar dos separadores de procesos
                                            .replace(/\);\{/g, '){') //Quitar separadores de procesos entre el anulado y su reemplaso
                                            //.replace(new RegExp(";NR:" + idProcesoAAgregar, "g") , `;A-NR:${idProcesoAAgregar}`);
                                        }

                                        console.log(parteAnterior.bgRed);
                                        console.log(ParteAnteriorCodigoLectura);
                                    }
                                });
                                // ParteAnteriorCodigoLectura = `${ParteAnteriorCodigoLectura[ParteAnteriorCodigoLectura.length - 2]}${procesoEliminado}`; // resulta en la parte anterior (que no se modifica)  del codigoLectura
                            }else{
                                ParteAnteriorCodigoLectura = `${contenidoCodigoLectura.split(proceso)[0]}${proceso};`; // resulta en la parte anterior (que no se modifica)  del codigoLectura
                            }
                            
                            procesoSiguienteAgregado = true;
                        }else if(procesoSiguienteAgregado){ //Si es el siguiente proceso                            
                            //Se recrea el siguiente proceso para que coincida con el que se creara en tre el porseso del que vino con el siguiente
                            if(tipoProceso == 'B-NR' || tipoProceso == 'B-A-NR'){
                                //Crear las partes del proceso
                                var areasSiguienteProceso = proceso.match(/\((.*?)\)/)[1].split(',');                             
                                ParteAnteriorCodigoLectura = ParteAnteriorCodigoLectura + crearCodigoProceso(proceso, tipoProceso, idProceso, areasSiguienteProceso, numeroReemplasos) + ';';
                            }else{
                                procesoSiguienteAgregado = false;

                                //Crear las partes del proceso
                                var areasSiguienteProceso = [ req.body.direccionalidadConectorHijoFinal, proceso.match(/\((.*?)\)/)[1].split(',')[1]];                             
                                siguienteProceso = crearCodigoProceso(proceso, tipoProceso, idProcesoAAgregar + 2, areasSiguienteProceso, numeroReemplasos) + ';';
                            }                            
                        }else if(idProceso >= idProcesoAAgregar + 1){ //Establecer los procesos siguientes (los que van despues del siguiente en la linea)
                            //Reestablezer el Id de los procesos posteriores
                            
                            //Crear las partes del proceso
                            var areasSiguienteProceso = proceso.match(/\((.*?)\)/)[1].split(',');

                            var proceso = crearCodigoProceso(proceso, tipoProceso, idProceso + 1, areasSiguienteProceso, numeroReemplasos);

                            PartePosteriorCodigoLectura  = (PartePosteriorCodigoLectura + `${proceso};`).replace('undefined', '');
                        }

                        //Si el proceso ya esta listo para enviar (ya dio continuacion y es el ultimo en la linea entonces...)
                        if(indiceProceso && coincidenciasProcesosCodigoLectura.length ==  indice + 1){
                            var codigoLecturaActualizado = 
                            (`#[${procesosAnteriores}${actualizacionProcesoAnulado}${procesosPosteriores}]`)
                            .replace('undefined', '')
                            .replace(/ /g, '');
                            //Enviar el nuevo codigo Completo
                            console.log(codigoLecturaActualizado.green);

                            resolve(codigoLecturaActualizado);
                        }
                        if(contenidoCodigoLectura.split(';').length == indice + 2){ //Cuando ya termino de procesar cada proceso, ahora reunira las partes del codigo y lo reconstruira (se manda respuesta)
                            nuevoCodigoLecturaProcesos = (`#[${ParteAnteriorCodigoLectura}${nuevoProceso}${siguienteProceso}${PartePosteriorCodigoLectura}]`).replace('undefined', '').replace(/ /g, '');
                            console.log(nuevoCodigoLecturaProcesos.green);

                            console.log(ParteAnteriorCodigoLectura.bgGreen);
                            console.log(nuevoProceso.bgGreen);
                            console.log(siguienteProceso.bgGreen);
                            console.log(PartePosteriorCodigoLectura.bgGreen);


                            resolve(nuevoCodigoLecturaProcesos);
                        }

                    }
                });

                return false;
            });

            setTimeout(()=>{
                reject('TiempoExedido') //En caso en el que la solisitud haya tardado mucho que concidere eso como error
            }, 8000)
        });
        */
        //Actualizar los datos en caso de que todo halla salido bien
        await new Promise((resolve, reject)=>{
            var idImagenNueva = `${NumeroImagenesMismaArea + 1}-${req.body.area}`
            var areaNuevaImagen = req.body.area;
            var descripcion_nombreNuevaImagen = req.body.nombreImagen;
            var BLOBNuevaImagen = req.file.buffer; 

            var peticion = 
            `INSERT INTO ImagenesAreas (imagenID ,areaID, nombre_Imagen, imagenEncriptada)
            VALUES (?, ?, ?, ?)`;
            
            db.run(peticion,[idImagenNueva, areaNuevaImagen, descripcion_nombreNuevaImagen, BLOBNuevaImagen], (err)=>{
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