$(document).ready(function(){
    //CLICK A AREA
    //Si se da click en una area despues de darle al icono de agregar, entonces que aparesca una ventana 'emergente' en el lugar del area
    
    
    $(document).on('click', '.iconoSuma', function(){

        setTimeout(()=>{
            var procedimientoActual = $(this).parent();
            var nuevoProcedimientoTemporal = procedimientoActual.find('.procedimientoHijo.subproceso');
        
            $(document).one('click', `.Area`, function(){
                function invocarVentanaEmergenteAgregar(tipoRespuesta){
                    $.ajax({
                        url: '/PanelDeControl_Ingeniero-Industrial/contenidoVentana',
                        method: 'POST',
                        data: {
                            tipoRespuesta: tipoRespuesta, //esta es eel tipo de respuesta que va a ser invocada (puede ser de repetido, abierto y demas)
                            tipoDeSituacion: 'agregar', //esta es el tipo de situacion que va a ser invocada (puede ser de anular, agregar o de error)
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
                        $('#LineaDeProduccionOpcionesProducto').html(response); //Se imprime la linea de produccion actualizada
                    }).fail(function(error){
                        console.log('error al realizar la solicitud', error);
                    })
            
                    $('#LineaDeProduccionOpcionesProducto').css('display', 'block');
                    unClick = true;
                }
                
                const areaClickeada = $(this);
    
                //COMBERTIR EN UNA VENTANA EMERGENTE
    
                $('#ventanaConfirmacion').dialog('open');
    
                //Encontrar la ubicacion final del produco señalado por el conecto
    
    
                var direccionalidadInicialHijo = procedimientoActual.find('.conector')[0].classList[4];
                var direccionalidadFinalHijo = areaClickeada[0].id;
    
                var direccionalidadInicialPadre = procedimientoActual.find('.conector')[0].classList[3];
                var direccionalidadFinalPadre = procedimientoActual.find('.conector')[0].classList[4];
    
                invocarVentanaEmergenteAgregar('abierta');
    
    
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
                        //Eliminar el procedimiento temporal
                    
                        ActualizarLineaProducion();
                    }
                });

                //Aceptar
                $(document).on('click', '.botonEleccion#aceptar', function(){

                    if(!unClick){
                        //elegir en donde inicia el hijo

                        //Estos datos seran usados tanto para la verificacion como para enviarlos en la solicitud
                        var procedimientoIconomasCliceadoID = procedimientoActual[0].id;
                        var IdProcesoActual = procedimientoIconomasCliceadoID.split('_');

                        //Hacer una revicion para saber los datos de el inicial del hijo

                        if(procedimientoActual.find('.subproceso').length > 1){ //Si tene un subproceso entonces enpesara en donde termina el ultimo subproceso

                            var subprocesos = procedimientoActual.find('.subproceso');
                            var direccionalidadInicialHijo = subprocesos[subprocesos.length - 2].querySelector('.subConector').classList[4];
        
                        }else{//Si no entonces cogera la ubicacion del padre
                            var direccionalidadInicialHijo = procedimientoActual.find('.conector')[0].classList[4];
                        }
                        var direccionalidadFinalHijo = areaClickeada[0].id;
                        
                        var direccionalidadInicialPadre = procedimientoActual.find('.conector')[0].classList[3];
                        var direccionalidadFinalPadre = procedimientoActual.find('.conector')[0].classList[4];

                            //Elegir si se  puede agregar un nuevo procedimiento por los requisitos necesarios (queno sea repetido)

                        var exito = false;

                                                
                        $('.proceso').each((indice, proceso)=>{
                            var idProcesoActual = $(proceso)[0].id;                        
                            
                            if(idProcesoActual == `proceso_${parseInt(IdProcesoActual[1]) + 1}`){
                                var procesoSiquiente = proceso;

                                var procesoSiguietePrimerConector = $(procesoSiquiente).find('.conector:last');

                                var inicioSiquienteConector = procesoSiguietePrimerConector[0].classList[3];
                                var finalSiquienteConector = procesoSiguietePrimerConector[0].classList[4];


                                console.log(procesoSiquiente);
                                console.log(procesoSiguietePrimerConector);
                                console.log(procesoSiguietePrimerConector);

                                if(inicioSiquienteConector == direccionalidadInicialHijo && finalSiquienteConector == direccionalidadFinalHijo){
                                    exito = false
                                    return false;
                                }else{
                                    exito = true;
                                }
                            }else{
                                exito = true;
                            }
                        });
                    
                        //En el caso en el que cumple con las espectativas (que no se repita con el siquiente proceso) se puede proceder a hacer el correspondiente procesamiento

                        if(exito){
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

                            //Este es el ID del producto actual (al que se le va a agreger un nuevo proceso
                            
                            var IdProductoActual = parseInt($('.producto.actual')[0].id)

                            
                            if(IdProcesoActual[1].match(/./) !== null){
                                IdProcesoActual = IdProcesoActual[1].split('.')[0];
                            }else{
                                IdProcesoActual = IdProcesoActual[1]
                            }
                            
                            $.ajax({
                                url: '/PanelDeControl_Ingeniero-Industrial/agregarProceso',
                                method: 'POST',
                                data: {
                                    IdProductoActual: IdProductoActual,
                                    IdProcesoActual: IdProcesoActual,
                                    direccionalidadConectorPadreInicial: direccionalidadInicialPadre, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                                    direccionalidadConectorPadreFinal: direccionalidadFinalPadre, //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                                    direccionalidadConectorHijoInicio: direccionalidadInicialHijo, //Este dato probiene del final de el padre (su ultimo lugar por el conector) y el area clickeada
                                    direccionalidadConectorHijoFinal: direccionalidadFinalHijo //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                                },
                            }).done(function(data){
                                if(data.tipoRespuesta == 'Tiempo Exedido'){
                                    invocarVentanaEmergenteAnular('Error');
                                }
                                //Actualizar la linea de produccion
                                ActualizarLineaProducion();

                                $('#LineaDeProduccionOpcionesProducto').css('display', 'block');
                                setTimeout(() => {
                                    $('.areaEscroleableY')[0].scrollTop = $('.areaEscroleableY')[0].scrollHeight;
                                }, 100);
                            }).fail(function(error){
                                console.log('Ocurrio un error en el procedimiento', error);
                            });    
                        }else{
                            invocarVentanaEmergenteAgregar('repetido');
                        }
                        
                    }
                    
                });
            });
       
        }, 200) 
    });
});