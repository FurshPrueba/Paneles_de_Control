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
    
    var sortableList = document.querySelector('.contenedorAreas');
    new Sortable(sortableList, {
        animation: 150,
        direction: 'vertical',
        handle: `.Area`,
        filter: '.no-sort', // Elementos con la clase 'no-sort' no serán arrastrables
        onEnd: function (/**Event*/evt) {
            const reorderableItems = Array.from(evt.target.querySelectorAll('.Area'))
                .map(item => item.id)
                .join(';'); // Une los elementos del array con ';'

            var area = evt.target.id;

            console.log(reorderableItems);
            console.log(area);

            const Data = {reorderableItems: reorderableItems.trim()};
            
            
            $.ajax({
                url: '/PanelDeControl_disenador-Industrial/reorganizarArea',
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
});

