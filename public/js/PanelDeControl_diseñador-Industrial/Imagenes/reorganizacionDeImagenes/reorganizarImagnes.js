'use strict'

$(document).ready(function(){
    // Inicializar SortableJS en una lista horizontal
    
    /// FUNCION PARA QUE, DESPUES GUARDAR LA IMAGEN, SE ACTUALICEN EL PANEL DE CONTROL
    function actualizarOpcionesImagenes(){
        $.ajax({
            url: '/PanelDeControl_Disenador-Industrial/dataImagenes',
            method: 'POST',
            data: 'ActializarListaImagenes',
            dataType: 'html'
        }).done(function(data){
            $('.Areas').html(data);
        }).fail(function(error){
            console.log('Ocurrio un error en el procedimiento', error);
        });
    }
    
    var sortableList = document.querySelectorAll('.Area');
    for(var i = 0; i < sortableList.length; i++){
        var sortableListiterada = sortableList[i];
        new Sortable(sortableListiterada, {
            animation: 150,
            direction: 'horizontal',
            handle: '.Area',
            filter: '.no-sortImage', // Elementos con la clase 'no-sort' no serán arrastrables
            onEnd: function (/**Event*/evt) {
                const reorderableItems = Array.from(evt.target.querySelectorAll('.contenedorImagen'))
                    .map(item => item.id)
                    .join(';'); // Une los elementos del array con ';'
    
                var area = evt.target.id;
    
                const Data = {area: area.trim(), reorderableItems: reorderableItems.trim()};
                
                $.ajax({
                    url: '/PanelDeControl_disenador-Industrial/reorganizarImagenes',
                    type: 'POST',
                    data: Data,
                    success: function(response) {
                        //actualizarOpcionesImagenes ()
                    },
                    error: function(error) {
                        console.error('Error al enviar el archivo:', error);
                        reject(error);
                    }
                });
            }
        });

    }
});

