'use strict'

$(document).ready(function(){
    
    $('.areaEscroleableX').on('scroll', function(){
        const scrollX = $(this).scrollLeft();
        $('.numerador').css('transform', `translateX(+${scrollX}px)`); // Corregir 'trasnsform' a 'transform'
    });
});