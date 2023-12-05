$(document).ready(function(){

    $(document).on('click', '.producto', function(){
        setTimeout(()=>{
            $('.conector').each((indice, elemento)=>{
        
                if(elemento.classList[4] == 'actual'){
                    var ubicacionIconoAnular = $(elemento).parent().find('.iconoAnular');
                    ubicacionIconoAnular.css('display', 'none');
                }
            });
        }, 200);
    });
});