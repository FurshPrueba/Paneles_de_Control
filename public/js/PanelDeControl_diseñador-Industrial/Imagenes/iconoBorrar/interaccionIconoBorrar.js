'use strict'
$(document).ready(function(){
    //CLICK AL ICONO DE SUMA
    
    var ventanaEmergente;
    var imagenABorrar;
    var area;

    function configurarventanaEmergente(width, height){
        return $('#ventanaConfirmacion').dialog({
            autoOpen: false,
            width: width,
            height: height,
            modal: true,
            draggable: false,
            resizable: false,
        });
    }
    //Que aparescan las opciones de clikeado a las areas al hacer click en el Icono De MAs
    $(document).on('click', '.iconoBorrar', function(){
        // Funcion ára invocar la ventana emergente        

        function invocarVentanaEmergenteBorrar(tipoRespuesta){
            $.ajax({
                url: '/PanelDeControl_Disenador-Industrial/contenidoVentana',
                method: 'POST',
                data: {
                    tipoRespuesta: tipoRespuesta, //esta es eel tipo de respuesta que va a ser invocada (puede ser de repetido, abierto y demas)
                    tipoDeSituacion: 'borrarPaso', //esta es el tipo de situacion que va a ser invocada (puede ser de anular, agregar o de error)
                },
                dataType: 'html'
            }).done(function(data){
                $('#contenidoVentanaConfirmacion').html(data);

                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '10px');
            }).fail(function(error){
                console.log('Ocurrio un error en el procedimiento', error);
            });
        }
        function ActualizarLineaProducion(){
                                //Esto actualizara la vista de TODA la linea de produccion
            //En todo este bloque se actualizara la vista del todas las opciones de la linea de produccion
            $.ajax({
                url: `/PanelDeControl_Disenador-Industrial/dataImagenes`,
                method: 'POST',
                data: null,
                dataType: 'html',
            }).done(function(response){
                $('.Areas').html(response); //Se imprime la linea de produccion actualizada
            }).fail(function(error){
                console.log('error al realizar la solicitud', error);
            })
            
            $('.Areas').css('display', 'block');
        }
        
        //COMBERTIR EN UNA VENTANA EMERGENTE
        
        invocarVentanaEmergenteBorrar('abierta');
        ventanaEmergente = configurarventanaEmergente(500, 300);
        ventanaEmergente.dialog('open');
        imagenABorrar = $(this).parent()[0].id;
        area = $(this).closest('.Area')[0].id;

        //Opciones de la ventana emergente ====
        var unClick = false

        $(document).on('click', '.botonEleccion#cancelar', function(){
            if(!unClick){
                unClick = true;
                //Cerrar al ventana emergente
                ventanaEmergente.dialog('close');
                //Cerrar la ventana emergente
                ventanaEmergente.dialog('destroy');
                $('#contenidoVentanaConfirmacion').html("");
            }
        });

        //Aceptar
        $(document).on('click', '.botonEleccion#borrar', function(){ 
            if(!unClick){
                unClick = true;
                //Cerrar al ventana emergente
                ventanaEmergente.dialog('close');
                //Cerrar la ventana emergente
                ventanaEmergente.dialog('destroy');
                $('#contenidoVentanaConfirmacion').html("");
                $.ajax({
                    url: "/PanelDeControl_Disenador-Industrial/borrarImagen",
                    method: 'POST',
                    data: {
                        imagenBorrada: imagenABorrar,
                        Area: area,
                    },
                }).done(function(){
                    //Actualizar la linea de produccion
                    ActualizarLineaProducion();
                    $('.Areas').css('display', 'block');
                }).fail(function(error){
                    console.log('Ocurrio un error en el procedimiento', error);
                });    
            }
        });

    });
});

