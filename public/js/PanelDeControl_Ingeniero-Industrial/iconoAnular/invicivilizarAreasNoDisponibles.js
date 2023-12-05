'use strict'
$(document).ready(function(){
    $(document).on('click', '.iconoAnular', function(){
        var procedimientoActual = $(this).parent();
    
        //Dejar seleccionar solo las areas disponibles (a las que el producto en el prosedimiento pueda ir y tenga sentido)
        
        var conectorAAgregar = procedimientoActual.find('.conector')[0]; //este proceso se va a agregar
        var idAreaRestringidas = [conectorAAgregar.classList[3], conectorAAgregar.classList[4]];
    
        //Darle la clase portadora de estilos a las areas

        $('.Area').addClass('clickeable');
        //Esta area no sera clickeable ya que es la misma area que da origen al subproceso, no tendria sentido que termine donde empieza
        $(`#${idAreaRestringidas[0]}`).addClass('noClickeable'); //Estas ordenes solo se van a aplicar a las areas que NO son la indicada por el conector actual (el  que se va a agregar)
        $(`#${idAreaRestringidas[1]}`).addClass('noClickeable'); //Estas ordenes solo se van a aplicar a las areas que NO son la indicada por el conector actual (el  que se va a agregar)
    });    
});