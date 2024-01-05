$(document).ready(function(){
    //Funcion para actualizar toda la plantilla
    function actualizarPlantilla(){
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

    var clickeado = false

    var area;
    var numerador;
    var iconoEditar;
    var iconoConfirmacion;
    var inputCambiarNOmbreArea;
    var nombreArea;
    var nombreAreaValorActual
    var nombreAreaValorCreado;

    //Cuando se haga click a un numerador, epezar proceso de cambiar nombre
    $(document).on("click",  ".CampoNombreGama", function(){
        clickeado = true;
        //Establecer valores
        numerador = $(this); //Este es el campo (el boton) que se oprime
        area = numerador.parent()[0].id;
        iconoEditar = numerador.find(".iconoEditar"); // Este es el icono por defecto del boton
        iconoConfirmacion = numerador.find(".IconoConfirmacion"); //Este es el icono para confirmar cambio en caso de ellos
        inputCambiarNOmbreArea = numerador.find(".inputNombreGama"); //input que te deja cambiar el nombre
        nombreArea = numerador.find("h3");
        nombreAreaValorActual = nombreArea.text();
        nombreAreaValorCreado = "";

        //CAMBIOS
            //cambiar el valor de todos los numeradores (para hacer qeu solo haya una opcion de numerador a la vez)
        $(".iconoEditar").addClass("visible"); //Hacer visible
        $(".nombreGama").addClass("visible"); //Hacer visible
        $(".inputNombreGama.visible").removeClass("visible"); //Quitarle la visivilidad a todos los numeradores
        $(".IconoConfirmacion.visible").removeClass("visible"); //Quitarle la visivilidad a todos los numeradores

        iconoEditar.removeClass("visible"); //Dejar de hacer visible
        nombreArea.removeClass("visible"); //Dejar de hacer visible
        iconoConfirmacion.addClass("visible"); //Hacer visible
        inputCambiarNOmbreArea.addClass("visible"); //Hacer visible 
        inputCambiarNOmbreArea.val(nombreAreaValorActual); //Darle el valor original (de ahi se podra modificar)

    });

    //Caundo ya es visible, dar la opcion de cambiar lso datos
    $(document).on("click",  ".inputNombreGama", function(evet){
        this.focus(); //Darle el foco a el input (para poder modificar los datos)
    });

    //CONFIRMAR CAMBIO
    $(document).on("click",  ".IconoConfirmacion", function(evet){
        nombreAreaValorCreado = inputCambiarNOmbreArea.val();

        if(nombreAreaValorActual == nombreAreaValorCreado || nombreAreaValorCreado == ""){
            numerador.addClass("error");

            setTimeout(() => {
                numerador.removeClass("error");
            }, 500);
        }else{
            numerador.addClass("exito");
            
            $.ajax({
                url: '/PanelDeControl_Disenador-Industrial/cambiar_nombreArea',
                type: 'POST',
                data: {
                    area: area,
                    nuevoNombre: nombreAreaValorCreado,
                },
                success: function() {
                    actualizarPlantilla()
                    setTimeout(() => {
                        numerador.removeClass("exito");
                    }, 500);
                },
                error: function(error) {
                    numerador.addClass("error");

                    setTimeout(() => {
                        numerador.removeClass("error");
                    }, 500);                }
            });
        }
    });

    //Caundo se clickea una parte de la pantalla que no es un numerador
    $(document).on("click", function(event){
        if (!$(event.target).closest('.numerador').length) {
            $(".iconoEditar").addClass("visible"); //Hacer visible
            $(".nombreArea").addClass("visible"); //Hacer visible
            $(".inputNumerador.visible").removeClass("visible"); //Quitarle la visivilidad a todos los numeradores
            $(".IconoConfirmacion.visible").removeClass("visible"); //Quitarle la visivilidad a todos los numeradores
        }
    });
    
});