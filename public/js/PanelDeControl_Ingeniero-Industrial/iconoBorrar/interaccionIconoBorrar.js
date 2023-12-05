'use strict'

$(document).ready(function(){
//CLICK AL ICONO DE SUMA

    //Que aparescan las opciones de clikeado a las areas al hacer click en el Icono De MAs
    $(document).on('click', '.iconoBorrar', function(){

        //Desactivar las opciones de clickeado a los productos (causa errores), se seleccionan todos lo sproductos y se le agrega la clase de noCLickeable

        $('.producto').addClass('noClickeable');

        //Hacer animacion de crear un nuevo procedimiento hijo del original (procedimiento actual)

        var procedimientoActual = $(this).parent();
        
        //Segir con los demas procedimientos
        function invocarVentanaEmergenteBorrar(tipoRespuesta){
            $.ajax({
                url: '/PanelDeControl_Ingeniero-Industrial/contenidoVentana',
                method: 'POST',
                data: {
                    tipoRespuesta: tipoRespuesta, //esta es eel tipo de respuesta que va a ser invocada (puede ser de repetido, abierto y demas)
                    tipoDeSituacion: 'borrar', //esta es el tipo de situacion que va a ser invocada (puede ser de anular, agregar o de error)
                    direccionalidadConectorHijoInicio: 'NaNaN', //Este dato probiene del final de el padre (su ultimo lugar por el conector) y el area clickeada
                    direccionalidadConectorHijoFinal: 'NaNaN', //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                    direccionalidadConectorPadreInicial: 'NaNaN', //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                    direccionalidadConectorPadreFinal: 'NaNaN', //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
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
        
        //COMBERTIR EN UNA VENTANA EMERGENTE

        invocarVentanaEmergenteBorrar('abierta');

        $('#ventanaConfirmacion').dialog('open');




        //Opciones de la ventana emergente ====


        var unClick = false

        $(document).on('click', '.botonEleccion#cancelar', function(){
            
            if(!unClick){
                unClick = true;
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
                unClick = true;
                //elegir en donde inicia el hijo

                
                //Hacer una revicion para saber los datos de el inicial del hijo


                    //Elegir si se  puede agregar un nuevo procedimiento por los requisitos necesarios (queno sea repetido)           
                    
                    //En el caso en el que cumple con las espectativas (que no se repita con el siquiente proceso) se puede proceder a hacer el correspondiente procesamiento
                    
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
                var direccionalidadFinalPadre = procedimientoActual.find('.conector')[0].classList[3];

                var procedimientoIconomasCliceadoID = procedimientoActual[0].id;
                var IdProcesoActual = procedimientoIconomasCliceadoID.split('_');
                var IdProductoActual = parseInt($('.producto.actual')[0].id);
                
                
                if(IdProcesoActual[1].match(/./) !== null){
                    IdProcesoActual = IdProcesoActual[1].split('.')[0];
                }else{
                    IdProcesoActual = IdProcesoActual[1]
                }
                
                $.ajax({
                    url: '/PanelDeControl_Ingeniero-Industrial/borrarProceso',
                    method: 'POST',
                    data: {
                        IdProductoActual: IdProductoActual,
                        IdProcesoActual: IdProcesoActual,
                        direccionalidadConectorPadreInicial: direccionalidadFinalPadre //Este dato probiene del area clickeada de el padre (su ultimo lugar por el conector) y el area clickeada
                    },
                }).done(function(data){
                    if(data.tipoRespuesta == 'Tiempo Exedido'){
                        invocarVentanaEmergenteBorrar('Error');
                    }
                    //Actualizar la linea de produccion
                    ActualizarLineaProducion();

                    $('#LineaDeProduccionOpcionesProducto').css('display', 'block');
        
                }).fail(function(error){
                    console.log('Ocurrio un error en el procedimiento', error);
                });    
            }
        });

    });
});

