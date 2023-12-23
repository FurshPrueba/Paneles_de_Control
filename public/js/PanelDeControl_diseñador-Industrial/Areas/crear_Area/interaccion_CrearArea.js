$(document).ready(function(){
        //CLICK A AREA
    //Si se da click en una area despues de darle al icono de agregar, entonces que aparesca una ventana 'emergente' en el lugar del area
    
    // Esta sera la imagen en BLOB
    
    var Clicks = false;
    var BlobCortado; 
    var cropper = null;
    var area = null;
    var IDimagenAnterior;

    var ventanaEmergente;
    
    function configurarventanaEmergente(width, height){
        return $('#ventanaConfirmacion').dialog({
            autoOpen: false,
            width: width,
            height: height,
            modal: true,
            draggable: false,
            resizable: false,
        });
    }

    function invocarVentanaEmergenteAgregar(urlBlob,tipoDeImagen, area){
        $.ajax({
            url: '/PanelDeControl_Disenador-Industrial/contenidoVentana',
            method: 'POST',
            data: {
                urlBlob: urlBlob, //esta es eel tipo de respuesta que va a ser invocada (puede ser de repetido, abierto y demas)
                tipoDeSituacion: tipoDeImagen, //esta es el tipo de situacion que va a ser invocada (puede ser de anular, agregar o de error)
                area: area
            },
            dataType: 'html'
        }).done(function(data){
            $('#contenidoVentanaConfirmacion').html(data);

            setTimeout(() => {
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '20px');
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('left', '37px');
            }, 100);
            
        }).fail(function(error){
            console.log('Ocurrio un error en el procedimiento', error);
        });
    }
    

    /// FUNCION PARA HACERLE UNA REVICION A LOS DATOS DE LA IMAGEN QUE SE ENVIARA
    function revicionYPeticionAlServidorGuargarImagen (area){
        $(document).on('click', '#aceptar', async function(){
            if(Clicks == false){

                Clicks = true;
                var nombreArea = $(this).closest(".contenidoVentanaEmergente").find('#nombreArea');

                if(nombreArea[0].value.trim() !== ''){//Si el campo NO esta vacio entonces.. 
                    //Se optiene el valor de El nombre de la area
                    nombreArea = nombreArea[0].value;
                    
                    if($(".Area").length > 0){
                        console.log($(".Area").length);
                        var areaAnterior = $(".Area")[$(".Area").length - 1].id;

                    }else{
                        var areaAnterior = "A0";
                    }
                    var areaNueva = area;
                    console.log("areaAnterior =" + areaAnterior);
                    console.log("areaNueva =" + areaNueva);
                    console.log("nombreArea =" + nombreArea);


                    
                    
                    try {
                        await new Promise((resolve, reject)=>{
                            setTimeout(() => { //tarda un momento en actualizar los datos
                                var formData = new FormData();
                                formData.append('areaAnterior', areaAnterior.trim());
                                formData.append('areaNueva', areaNueva.trim());
                                formData.append('nombreArea', nombreArea.trim());

                                $.ajax({
                                    url: '/PanelDeControl_disenador-Industrial/agregarArea',
                                    type: 'POST',
                                    data: formData,
                                    processData: false,
                                    contentType: false,
                                    success: function() {
                                        resolve();
                                    },
                                    error: function(error) {
                                        reject(error);
                                    }
                                });
                            }, 100);
                        });     
                        
                        await new Promise((resolve, reject) => {
                            actualizarOpcionesImagenes();
                            
                            ventanaEmergente.dialog('open');                                
                            setTimeout(() => {
                                ventanaEmergente.dialog('close');
                                ventanaEmergente.dialog('destroy');
                                $('#contenidoVentanaConfirmacion').html("");
                            }, 200);
                            
                            resolve();
                        });

                    } catch (error) {
                        var espacioError = $(this).parent().parent().find('#espacioError');
                        espacioError.text('Error al guardar los datos');
                        setTimeout(()=>{
                            espacioError.text('');
                        }, 3000)
                    }

                }else{ // Si no..
                    Clicks = false;

                    if(nombreArea[0].value.trim() == ''){
                        nombreArea.addClass("error");
                    }
                    setTimeout(()=>{
                        nombreArea.removeClass("error");
                    }, 3000)
                }
            }
        }); 
    }
    
    /// FUNCION PARA QUE, DESPUES GUARDAR LA IMAGEN, SE ACTUALICEN EL PANEL DE CONTROL
    function actualizarOpcionesImagenes (){
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
    
    function cerrarVentana(Clicks, ventanaEmergente) {
        $(document).on('click', `.botonEleccion.cerrar`, function(){ 
            if(Clicks == false){
                Clicks = true;
                ventanaEmergente.dialog('open');
                setTimeout(() => {
                    ventanaEmergente.dialog('close');
                    ventanaEmergente.dialog('destroy');
                    $('#contenidoVentanaConfirmacion').html("");
                }, 200);
            }        
        });
    }
    
    //EVENTO AL ICONO DE AGREGAR UNA IMAGEN
    $(document).on('click', '.iconoSumaArea', function(){
        Clicks = false;
        ventanaEmergente = configurarventanaEmergente(450, 250);
        cerrarVentana(Clicks, ventanaEmergente);
        ventanaEmergente.dialog('open');
        area =  `A${$(".Area").length + 1}`;
        console.log(area);
        invocarVentanaEmergenteAgregar('NotImage', 'crearArea', area);
        
        revicionYPeticionAlServidorGuargarImagen (area)
    });
    
    
});