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

function invocarVentanaEmergenteAgregar(urlBlob,tipoDeImagen, area, BlobCortado){
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
            $('#ventanaConfirmacion').css('opacity', '1');
            if(tipoDeImagen == 'seleccionarTipoDeBusqueda'){
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '10px');
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('left', '32%');
            }else if(tipoDeImagen == 'CorteIMG'){
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '20px');
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('left', '163px');
                //Poner la imagen lista para ser recortada
                
                var imagen = document.getElementById('ImagenARecortar');
                
                // Función para inicializar Cropper.js
                function inicializarCropper() {
                    if (imagen.complete) {
                        cropper = new Cropper(imagen, {
                            aspectRatio: 1, // Establece un recorte cuadrado (aspectRatio: 1)
                            viewMode: 1,
                            autoCropArea: 1
                        });
                    } else {
                        setTimeout(inicializarCropper, 100);
                    }
                }
                
                // Llamar a la función para inicializar Cropper.js
                inicializarCropper();
                /*
                // Función para actualizar la vista previa del recorte
                function actualizarVistaPrevia() {
                    if (cropper) {
                        var recorte = cropper.getCroppedCanvas().toDataURL('image/jpeg');
                        vistaPrevia.style.backgroundImage = 'url(' + recorte + ')';
                        vistaPrevia.style.backgroundSize = 'cover';
                    }
                }*/
            }else if(tipoDeImagen == 'DescribirYGuardar'){
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '-140px');
                $('#contenidoVentanaConfirmacion').find('#areaBotones').css('left', '390px');
                $('#contenidoVentanaConfirmacion').find('#areaBotones').find(".botonEleccion").css('width', '92px');
                $('#contenidoVentanaConfirmacion').find('#areaBotones').find(".botonEleccion").css('height', '50px');
                
            }
        }, 100);
    }).fail(function(error){
        console.log('Ocurrio un error en el procedimiento', error);
    });
}


/// FUNCION PARA QUE, DESPUES DE ELEGIR UNA IMAGEN se cargen las opciones
function mostrarOpcionesImagenes (file, area, tipoDeSituacion){
    var blob = new Blob([file], {type: file.type});
    var urlBlob = URL.createObjectURL(blob);
    invocarVentanaEmergenteAgregar(urlBlob,tipoDeSituacion, area);        
}

/// FUNCION PARA HACERLE UNA REVICION A LOS DATOS DE LA IMAGEN QUE SE ENVIARA
function revicionYPeticionAlServidorGuargarImagen (area, Clicks,BlobCortado, IDimagenAnterior, ventanaEmergente){
    $(document).on('click', '#aceptar', async function(){
        if(Clicks == false){
            Clicks = true;
            var area = $(this).parent().find("#infoArea")[0].classList[0];                
            try {
                BlobCortado = await new Promise((resolve, reject)=>{
                    cropper.getCroppedCanvas().toBlob(function(blob) {
                        // Convertir el blob en una URL de objeto
                        resolve(blob);
                        mostrarOpcionesImagenes (blob, area, "DescribirYGuardar");
                    });
                });
                
                
                await new Promise((resolve, reject)=>{
                    Clicks = false;
                    resolve();
                });     
            } catch (error) {
                var espacioError = $(this).parent().parent().find('#espacioError');
                espacioError.text('Error al guardar los datos');
                setTimeout(()=>{
                    espacioError.text('');
                }, 3000)
            }
        }
    }); 

    $(document).on('click', '#guardar', async function(){
        if(Clicks == false){

            Clicks = true;
            var area = $(this).parent().find("#infoArea")[0].classList[0];                
            var descripcionImagen = $(this).closest(".contenidoVentanaEmergente").find('#descripcionIMG');
            var timepoEstimado = $(this).closest(".contenidoVentanaEmergente").find('#selectorTiempos');

            if(descripcionImagen[0].value.trim() !== '' && timepoEstimado[0].value.trim() !== ''){//Si el campo NO esta vacio entonces.. 
                //Se optiene el valor de la descripcion de la imagen
                var nombreImagen = descripcionImagen[0].value;
                var timepoEstimadoDado = timepoEstimado[0].value;

                
                //Se optiene el BLOB de la imagen final (la a recortada)
            
                try {
                    await new Promise((resolve, reject)=>{
                        setTimeout(() => { //tarda un momento en actualizar los datos
                            var formData = new FormData();
                            formData.append('BlobCortado', BlobCortado);
                            formData.append('nombreImagen', nombreImagen.trim());
                            formData.append('area', area.trim());
                            formData.append('IDimagenAnterior', IDimagenAnterior.trim());
                            formData.append('timepoEstimado', timepoEstimadoDado.trim());

                            $.ajax({
                                url: '/PanelDeControl_disenador-Industrial/agregarImagen',
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
                    })
                } catch (error) {
                    var espacioError = $(this).parent().parent().find('#espacioError');
                    espacioError.text('Error al guardar los datos');
                    setTimeout(()=>{
                        espacioError.text('');
                    }, 3000)
                }

            }else{ // Si no..
                Clicks = false;

                if(descripcionImagen[0].value.trim() == ''){
                    descripcionImagen.addClass("error");
                }if(timepoEstimado[0].value.trim() == ''){
                    console.log(timepoEstimado[0].value.trim());
                    console.log(timepoEstimado[0].value.trim());
                    timepoEstimado.addClass("error");
                }
                setTimeout(()=>{
                    descripcionImagen.removeClass("error");
                    timepoEstimado.removeClass("error");
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
