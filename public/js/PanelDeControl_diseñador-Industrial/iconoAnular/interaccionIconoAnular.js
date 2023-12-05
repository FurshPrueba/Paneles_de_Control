'use strict'

$(document).ready(function(){
//CLICK AL ICONO DE SUMA
    //Que aparescan las opciones de clikeado a las areas al hacer click en el Icono De MAs
    $(document).on('click', '.iconoAnular', function(){

        //Desactivar las opciones de clickeado a los productos (causa errores), se seleccionan todos lo productos y se le agrega la clase de noCLickeable

        $('.producto').addClass('noClickeable');

        //Hacer animacion de crear un nuevo procedimiento hijo del original (procedimiento actual)

        var procedimientoActual = $(this).parent();
        var nuevoProcedimientoTemporal = document.createElement('div');

        nuevoProcedimientoTemporal.classList.add('procedimientoAnulado');
        nuevoProcedimientoTemporal.id = procedimientoActual.find('.procedimientoAnulado').length;


        procedimientoActual.append(nuevoProcedimientoTemporal);

        setTimeout(function() {
            
            //hacer mas alto el proceso (el mismo largo que el subproceso agregado)
            
            procedimientoActual.css('height', (procedimientoActual.height() + 60) + 'px');


            //Visivilidad del proceso temporal

            nuevoProcedimientoTemporal.innerHTML = `<div class="numerador">${procedimientoActual.find('.numerador:first').text() + '.' +  procedimientoActual.find('.procedimientoHijo').length}</div>`;
            $(nuevoProcedimientoTemporal).addClass('procesoCorreccionAnular');
   
            //ponerle a las opciones de la linea de produccion un color opaco de fondo (que no se pueda interactuar)

            $('#LineaDeProduccionOpcionesProducto').addClass('fondoOpaco');
        }, 0);


        
        //Seguir con los demas procedimientos
        
        //Dejar seleccionar solo las areas disponibles (a las que el producto en el prosedimiento pueda ir y tenga sentido)


        //Estas ordenes solo se van a aplicar a las areas que NO son la indicada por el conector actual (el  que se va a agregar)
        $('.conector').each((indice, conectorActual)=>{

            if(procedimientoActual.find('.subproceso').length > 0){

                //Igualar las vistas de las areas (quitarle la clase noClickeable a los procesos que lo tengan)
                $('.Area').each((indice, area)=>{
                    if(area.classList.contains('noClickeable')){
                        $(area).removeClass('noClickeable');
                        $(area).addClass('clickeable');
                    }
                });

                /*
                EN esta parte se podra elegir que areas son clickeables y cuales no, esto se basa principalmente por en donde termina el anterir proceso.
                
                De forma que, el proceos siquienrte que se intenta agregar no pueda tener el mismo final que el siquiente en la linea (ya que sera redundante).
                */
               
            }
        });

        
        //CLICK A AREA
        //Si se da click en una area despues de darle al icono de agregar, entonces que aparesca una ventana 'emergente' en el lugar del area
        
        //Ir a ventModalIconoAnular para segir con los procediminetos al click del area
    });
});

