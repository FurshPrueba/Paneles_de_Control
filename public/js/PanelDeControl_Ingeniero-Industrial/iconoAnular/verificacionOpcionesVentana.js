'use strict'

$(document).ready(function(){
    var primerConector;
    $(document).one('click', '.botonEleccion#aceptar', function(){

        
        setTimeout(()=>{ ///Para preever errores por el tiempo en el que se dan los cambios
    
    
            $('.conector').each((indiceSegundo, segundoConector)=>{//Dentro de este bucle se evalua si la cadena de conecotres (que reprecentam los procesos) tienen logica y estan uno detras del otro (si no lo estan entonces lo hace)
            
                if(indiceSegundo > 0){
                    //las dos deven de ser exactamente iguales
                    var continuidadX1 = $(primerConector)[0].classList[4];  //Este es el area al que va el conector primer conector 
                    var secuencialidadX2 = $(segundoConector)[0].classList[3]; //Este es el area de la que viene el segundo conector
        

                    //Si el final del primer conector en la secuncia es el msimo que el inicio del siquiente enconces que haga esto
        
                    if(continuidadX1 === secuencialidadX2){
        
                        primerConector = segundoConector;
        
                        //Retornar para seguir con el bucle
                        return primerConector;
                    }else{   //Si no son los mismos entonces que haga un efecto con los procedimientos posteriores
                        var segundoConector = segundoConector;
                        var indiceClaseAReemplazar = 3;  // Índice de la clase que deseas reemplazar
                        var nuevaClaseSegundoConector = continuidadX1;  // Nuevo valor de la clase
                        
                        // Obtén las clases actuales
                        var clases = segundoConector.getAttribute('class').split(' ');
                        
                        // Reemplaza la clase en el índice especificado

                        clases[indiceClaseAReemplazar] = nuevaClaseSegundoConector;
                                
                        // Une las clases actualizadas y establece el atributo 'class' del elemento
                        segundoConector.setAttribute('class', clases.join(' '));
        

                        /* REESTABLECER LA UBICACION QUE DEBEN DE TENER LOS CONECTORES PARA QUE TENGAN SENTIDO */

                        segundoConector = nuevaClaseSegundoConector;
                        return false;
                    }
                }else{
                    primerConector = segundoConector;
                    return primerConector;
                }
            });
        }, 50);

        setTimeout(()=>{
            $('.conector').each((indice, conector)=>{

                var areaA = document.querySelector(`#${$(conector)[0].classList[3]}`);

                var areaB = document.querySelector(`#${$(conector)[0].classList[4]}`);


                var x1 = areaA.offsetLeft + areaA.offsetWidth / 2;
                var x2 = areaB.offsetLeft + areaB.offsetWidth / 2;

                var x = Math.min(x1, x2);
                var width = Math.abs(x1 - x2);

                conector.style.width = width + "px";
                conector.style.height = 20 + "px";
                
                //saber si es un subconector  un conector (para calcular el pequeño tab del inico de los subConectores)
                if(conector.classList.contains('subConector')){
                    conector.style.left = (x - 45) + "px";
                }else{
                    conector.style.left = (x) + "px";
                }


                var direccionalidad = [$(conector)[0].classList[3], $(conector)[0].classList[4]];
    
                //AREA PRIMIGENEA
                var area1 = direccionalidad[0].trim().split('');

                //AREA a llevar
                var area2 = direccionalidad[1].trim().split('');

                if(area1[0] == 'B' && area1[1] <= area2[1]){
                    ActualizarDireccionalidad('avance', conector);
                }else if(area1[0] == 'A' && area1[1] < area2[1]){
                    ActualizarDireccionalidad('avance', conector);
                }else{
                    ActualizarDireccionalidad('retroceso', conector);
                }

                function ActualizarDireccionalidad(direccionalidad, selector){
                    //Actualizar el contenido de
                    var conector = selector;
                    var indiceClaseAReemplazar = 2;  // Índice de la clase de la direccionalidad <- ->
                    var nuevaClaseSegundoConector = direccionalidad;  // Nuevo valor de la clase
                    
                    // Obtén las clases actuales
                    var clases = conector.getAttribute('class').split(' ');
                    
                    // Reemplaza la clase en el índice especificado

                    clases[indiceClaseAReemplazar] = nuevaClaseSegundoConector;
    
                    // Une las clases actualizadas y establece el atributo 'class' del elemento
                    conector.setAttribute('class', clases.join(' '));
                }
            });
        }, 60);
    });  
});