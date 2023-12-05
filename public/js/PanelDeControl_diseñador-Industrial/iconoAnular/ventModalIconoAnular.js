$(document).ready(function(){
    //CLICK A AREA
    //Si se da click en una area despues de darle al icono de agregar, entonces que aparesca una ventana 'emergente' en el lugar del area
    
    
    $(document).on('click', '.iconoAnular', function(iconoAnularOprimido){

        setTimeout(()=>{
            var procedimientoActual = $(this).parent();
            var nuevoProcedimientoTemporal = procedimientoActual.find('.procedimientoHijo.subproceso');
        
            $(document).one('click', `.Area`, function(){

                //Funciones a implementar en el bloque
                function invocarVentanaEmergenteAnular(tipoRespuesta){
                    $.ajax({
                        url: '/PanelDeControl_Ingeniero-Industrial/contenidoVentana',
                        method: 'POST',
                        data: {
                            tipoRespuesta: tipoRespuesta, //esta es eel tipo de respuesta que va a ser invocada (puede ser de repetido, abierto y demas)
                            tipoDeSituacion: 'anular', //esta es el tipo de situacion que va a ser invocada (puede ser de anular, agregar o de error)
                            direccionalidadConectorHijoInicio: direccionalidadInicialHijo, //Este dato probiene del final de el padre (su ultimo lugar por el conector) y el area clickeada
                            direccionalidadConectorHijoFinal: direccionalidadFinalHijo, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                            direccionalidadConectorPadreInicial: direccionalidadInicialPadre, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                            direccionalidadConectorPadreFinal: direccionalidadFinalPadre, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                        },
                        dataType: 'html'
                    }).done(function(data){
                        $('#contenidoVentanaConfirmacion').html(data);
                    }).fail(function(error){
                        console.log('Ocurrio un error en el procedimiento', error);
                    });
                }function ActualizarLineaProducion(){
                                        //Esto actualizara la vista de TODA la linea de produccion
                    //En todo este bloque se actualizara la vista del todas las opciones de la linea de produccion
                    
                    var productoActual = $('.producto.actual');

                    $.ajax({
                        url: `/PanelDeControl_Ingeniero-Industrial/dataProducto`,
                        method: 'POST',
                        data:{ id: productoActual.attr('id')},
                        dataType: 'html',
                    }).done(function(response){
                        $('#LineaDeProduccionOpcionesProducto').html(response);
                    }).fail(function(error){
                        console.log('error al realizar la solicitud', error);
                    })
            
                    $('#LineaDeProduccionOpcionesProducto').css('display', 'block');
                    unClick = true;
                }
                
                const areaClickeada = $(this);//Esta es el area que se clickeo

                //Se llama a la funcion para invocar a la ventana con el tipo anular y la respuesta de todabia abieta (no se a realizado nada en la ventana)
                invocarVentanaEmergenteAnular('abierta')
                
                //ABRIR VENTANA EMERGENTE
    
                $('#ventanaConfirmacion').dialog('open');

                //Encontrar la ubicacion final del produco señalado por el conecto
                var direccionalidadInicialHijo = procedimientoActual.find('.conector')[0].classList[4];
                var direccionalidadFinalHijo = areaClickeada[0].id;
    
                var direccionalidadInicialPadre = procedimientoActual.find('.conector')[0].classList[3];
                var direccionalidadFinalPadre = procedimientoActual.find('.conector')[0].classList[4];
                //Opciones de la ventana emergente ====
                var unClick = false

                $(document).on('click', '.botonEleccion#cancelar', function(){
                    
                    if(!unClick){                        
                        //Cerrar al ventana emergente
                        $('#ventanaConfirmacion').dialog('close');
                        //Que se puedan clickear los productos
                        $('.producto').removeClass('noClickeable');
                        //Quitarle el fondo opaco a las oopciones de la linea de produccion
                        $('#LineaDeProduccionOpcionesProducto').removeClass('fondoOpaco');
                        //Quitarle las opciones de quickeable a las areas
                        $('.Area').removeClass('clickeable');
                        //Hacer vicible a los elementos no clickeables
                        $(`.Area`).removeClass('noClickeable');

                        //Acutalizar la linea de produccion
                        ActualizarLineaProducion();
                    }
                });

                //Aceptar
                $(document).on('click', '.botonEleccion#aceptar', function(){
                    if(!unClick){
                        //elegir en donde inicia el hijo
                        
                        var procedimientoIconomasCliceadoID = procedimientoActual[0].id; //Este es el Id del procedimiento actual
                                                
                        if(procedimientoActual.find('.subproceso').length > 1){ //Si tiene un subproceso entonces enpesara en donde termina el ultimo subproceso

                            var subprocesos = procedimientoActual.find('.subproceso');
                            var direccionalidadInicialHijo = subprocesos[subprocesos.length - 2].querySelector('.subConector').classList[3];
        
                        }else{//Si no entonces cogera la ubicacion del padre
                            var direccionalidadInicialHijo = procedimientoActual.find('.conector')[0].classList[3];
                        }
                        var direccionalidadFinalHijo = areaClickeada[0].id;
                        
                        var direccionalidadInicialPadre = procedimientoActual.find('.conector')[0].classList[3];
                        var direccionalidadFinalPadre = procedimientoActual.find('.conector')[0].classList[4];

                        //Elegir si se  puede anular procedimiento por los requisitos necesarios (que no sea repetido o refundante)

                        var procedimientoIconomasCliceadoID = procedimientoActual[0].id;
                        
                        //establecer el valor de IdProcesoActual para procesos y subprocesos
                        
                        /*
                        En esta parte se declara la funcion  a venida del el valor del id, tanto para macroprocesos como para subprocesos,
                        esto se relacionara para averiguar si cumple con los requicitos minimos para poder realizar la aunalacion (requisitos como por
                        ejemplo que el proceso que reemplaza al anulado no termine en donde termina el siguiente proceso, principalmente )
                        */
                        
                        var IdProcesoActual = procedimientoIconomasCliceadoID.split('_');
                        var exito = false;
                        verificarProcesoNORepetido('.proceso', `proceso_${IdProcesoActual[1]}`);
                               
                        
                        function verificarProcesoNORepetido (selectorIterable, configuracionId){
                            var encontradoProcesoActual = false;
                            $(selectorIterable).each((indice, proceso)=>{ //Iterra entre procesos para encontrar al macroproceso que sique en la linea de  produccion
                                var idProcesoActual = $(proceso)[0].id;                         
                                if(idProcesoActual == configuracionId){
                                    encontradoProcesoActual = true;
                                }else if(encontradoProcesoActual){
                                    encontradoProcesoActual = false;
                                    var procesoSiquiente = proceso;
    
                                    if(IdProcesoActual[0] == 'proceso'){
                                        var procesoSiguietePrimerConector = $(procesoSiquiente).find('.conector:last');
                                    }
    
                                    var finalSiquienteConector = procesoSiguietePrimerConector[0].classList[4];
    
                                    if(direccionalidadFinalHijo == finalSiquienteConector){
                                        exito = false
                                        return false;
                                    }
                                }else{
                                    exito = true;
                                }
                            });//El resultado es el valor booleano de axito (true si se encontro el siquiente con exito, false si no se encontro)    
                        }
                        //En el caso en el que cumple con las espectativas (que no se repita con el siquiente proceso) se puede proceder a hacer el correspondiente procesamiento

                        if(exito){//Si los requicitos para realizar el guardado son verdaderos, entonces procedera a crear el conector y hacer la correspondiente solicitud

                            /*
                                En este bloque de codigo se creara el conector que reprecenta 
                            */
                            unClick = true;
                            //Que se puedan clickear los productos
                            $('.producto').removeClass('noClickeable');
                            //Cerrar al ventana emergente
                            $('#ventanaConfirmacion').dialog('close');
                            //Quitarle el fondo opaco a las oopciones de la linea de produccion
                            $('#LineaDeProduccionOpcionesProducto').removeClass('fondoOpaco');
                            //Quitarle las opciones de quickeable a las areas
                            $('.Area').removeClass('clickeable');
                            //Hacer vicible a los elementos no clickeables
                            $(`.Area`).removeClass('noClickeable');
                            
                            //Cerrar al ventana emergente
                            $('#ventanaConfirmacion').dialog('close');

                            var IdProductoActual = parseInt($('.producto.actual')[0].id);


                            $.ajax({
                                url: '/PanelDeControl_Ingeniero-Industrial/anularProceso',
                                method: 'POST',
                                data: {
                                    IdProductoActual: IdProductoActual,
                                    IdProcesoActual: IdProcesoActual[1],
                                    direccionalidadConectorPadreInicial: direccionalidadInicialPadre, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                                    direccionalidadConectorPadreFinal: direccionalidadFinalPadre, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                                    direccionalidadConectorHijoInicio: direccionalidadInicialHijo, //Este dato probiene del final de el padre (su ultimo lugar por el conector) y el area clickeada
                                    direccionalidadConectorHijoFinal: direccionalidadFinalHijo //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                                },
                            }).done(function(data){
                                if(data.tipoRespuesta == 'Tiempo Exedido'){
                                    invocarVentanaEmergenteAnular('Error')
                                }
                                //En todo este bloque se actualizara la vista del todas las opciones de la linea de produccion

                                ActualizarLineaProducion();

                                $('#LineaDeProduccionOpcionesProducto').css('display', 'block');
                            }).fail(function(error){
                                console.log('Ocurrio un error en el procedimiento', error);
                            });       
                        }else{
                            invocarVentanaEmergenteAnular('repetido');
                        }
                        
                    }
                    
                });
            });
       
        }, 200) 
    });
});