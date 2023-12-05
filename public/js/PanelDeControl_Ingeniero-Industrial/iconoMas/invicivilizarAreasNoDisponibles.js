'use strict'
$(document).ready(function(){
    $(document).on('click', '.iconoSuma', function(){
        var procedimientoActual = $(this).parent();
    
        //Dejar seleccionar solo las areas disponibles (a las que el producto en el prosedimiento pueda ir y tenga sentido)
    
        
        var idAreaRestringida;
        
        if(procedimientoActual.find('.subproceso').length > 0){
            let subprocesos = procedimientoActual.find('.subproceso');
            console.log(subprocesos[subprocesos.length - 1]);
            idAreaRestringida = $(subprocesos[subprocesos.length - 1]).find('.conector')[0].classList[4];
        }else{
            var conectorAAgregar = procedimientoActual.find('.conector')[0]; //este proceso se va a agregar
            idAreaRestringida = conectorAAgregar.classList[4];
        }
    
        //Darle la clase portadora de estilos a las areas

        $('.Area').addClass('clickeable');
        //Esta area no sera clickeable ya que es la misma area que da origen al subproceso, no tendria sentido que termine donde empieza
        $(`#${idAreaRestringida}`).addClass('noClickeable'); //Estas ordenes solo se van a aplicar a las areas que NO son la indicada por el conector actual (el  que se va a agregar)
    

    });    
});