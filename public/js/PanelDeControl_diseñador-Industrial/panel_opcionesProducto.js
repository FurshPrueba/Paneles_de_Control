'use strict';
$(document).ready(function () {
    $('#contenedorProductos').css('width', document.querySelector('.areaEscroleableX').scrollWidth + 'px');
    $('#LineaDeProduccionOpcionesProducto').css('width', document.querySelector('.areaEscroleableX').scrollWidth + 'px');
    
     // Cuando se realiza un click a un producto y a un área en ese orden, se pone una línea que los conecta
    $(document).on('click', '.producto', function() {
        $.ajax({
            url: `/PanelDeControl_Ingeniero-Industrial/dataProducto`,
            method: 'POST',
            data:{ id: $(this).attr('id')},
            dataType: 'html',
        }).done(function(response){
            $('#LineaDeProduccionOpcionesProducto').html(response);

            //ANALIZAR TODOS LOS CONECTORES PARA VER CUAL ES EL ACTUAL

            var primerElementoNR = $('.conector.NR').first();


            if (primerElementoNR.length > 0) {
                // Selecciona el primer elemento con la clase "NR" y realiza acciones sobre él
                primerElementoNR.addClass('actual');

                var lugarAnimacionCarga = document.createElement('div');
                lugarAnimacionCarga.innerHTML = '<div class="carga"></div>';

                primerElementoNR.prepend(lugarAnimacionCarga);


                setInterval(()=>{
                    $(lugarAnimacionCarga).css
                }, 1300)
            }

        }).fail(function(error){
            console.log('error al realizar la solicitud', error);
        })


        $('#LineaDeProduccionOpcionesProducto').css('display', 'block');

        var productoClickeado = $(this);

        $('.producto').each((indice, element) => {

            if($(element).hasClass('actual')){
                $(element).removeClass('actual');
            }
            if($(element).hasClass('noActual')){
                $(element).removeClass('noActual');
            }

            if($(element)[0].id === productoClickeado[0].id){
                $(this).addClass('actual');
            }else{
                $(element).addClass('noActual');
            }
        });
    });
}); 