$(document).ready(function(){
    //CLICK A AREA
    //Si se da click en una area despues de darle al icono de agregar, entonces que aparesca una ventana 'emergente' en el lugar del area
    
    // Esta sera la imagen en BLOB
    
    var BlobCortado; 
    var cropper = null;
    var area = null;
    function invocarVentanaEmergenteAgregar(urlBlob,tipoDeImagen){
        $.ajax({
            url: '/PanelDeControl_Disenador-Industrial/contenidoVentana',
            method: 'POST',
            data: {
                urlBlob: urlBlob, //esta es eel tipo de respuesta que va a ser invocada (puede ser de repetido, abierto y demas)
                tipoDeSituacion: tipoDeImagen //esta es el tipo de situacion que va a ser invocada (puede ser de anular, agregar o de error)
           },
            dataType: 'html'
        }).done(function(data){
            $('#contenidoVentanaConfirmacion').html(data);
            setTimeout(() => {
                $('#ventanaConfirmacion').css('opacity', '1');
                if(tipoDeImagen == 'seleccionarTipoDeBusqueda'){
                    $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '10px');
                }else{
                    $('#contenidoVentanaConfirmacion').find('#areaBotones').css('top', '-180px');

                    //Poner la imagen lista para ser recortada
  
                    var imagen = document.getElementById('ImagenARecortar');
                    var vistaPrevia = document.getElementById('vistaPrevia');

                    // Función para inicializar Cropper.js
                    function inicializarCropper() {
                        if (imagen.complete) {
                            cropper = new Cropper(imagen, {
                                aspectRatio: 1, // Establece un recorte cuadrado (aspectRatio: 1)
                                viewMode: 1,
                                autoCropArea: 1,
                                cropend: function() {
                                    actualizarVistaPrevia();
                                },
                                zoom: function() {
                                    actualizarVistaPrevia();
                                }
                            });
                        } else {
                            setTimeout(inicializarCropper, 100);
                        }
                    }

                    // Llamar a la función para inicializar Cropper.js
                    inicializarCropper();

                    // Función para actualizar la vista previa del recorte
                    function actualizarVistaPrevia() {
                        if (cropper) {
                            var recorte = cropper.getCroppedCanvas().toDataURL('image/jpeg');
                            vistaPrevia.style.backgroundImage = 'url(' + recorte + ')';
                            vistaPrevia.style.backgroundSize = 'cover';
                        }
                    }
                }
            }, 100);
        }).fail(function(error){
            console.log('Ocurrio un error en el procedimiento', error);
        });
    }

    
    /// FUNCION PARA QUE, DESPUES DE ELEGIR UNA IMAGEN se cargen las opciones
    function mostrarOpcionesImagenes (file){
        var blob = new Blob([file], {type: file.type});
            
        var urlBlob = URL.createObjectURL(blob);
        
        invocarVentanaEmergenteAgregar(urlBlob, 'IMG');
        //$('#ventanaConfirmacion').dialog('open');
    }
    
        /// FUNCION PARA HACERLE UNA REVICION A LOS DATOS DE LA IMAGEN QUE SE ENVIARA
    function revicionYPeticionAlServidorGuargarImagen (area){
        
        $(document).on('click', '#guardar', async function(){
            var descripcionImagen = $(this).parent().parent().parent().find('#contenedordDescripcionIMG').find('#descripcionIMG');
            function crerrar_Ventana (selector){
                $(document).on('click', `.${selector}`, function(){
                    $('#ventanaConfirmacion').css('opacity', '0');
                    setTimeout(() => {
                        //console.log($('#ventanaConfirmacion').dialog());
                        $('#ventanaConfirmacion').dialog('close');
                        resolve();
                    }, 200);
    
                    setTimeout(() => {
                        //console.log($('#ventanaConfirmacion').dialog());
                        $('#ventanaConfirmacion').dialog('close');
                        reject('Tiempo Exedido');
                    }, 10000);
                });
            }
            
            if(descripcionImagen[0].value !== ''){//Si el campo NO esta vacio entonces.. 
                //Se optiene el valor de la descripcion de la imagen
                var nombreImagen = descripcionImagen[0].value;
                
                //Se optiene el BLOB de la imagen final (la a recortada)
                
                try {
                    BlobCortado = await new Promise((resolve, reject)=>{
                        cropper.getCroppedCanvas().toBlob(function(blob) {
                            // Convertir el blob en una URL de objeto
                            resolve(blob);
                        });
                    });
                                    
                    await new Promise((resolve, reject)=>{
                        setTimeout(() => { //tarda un momento en actualizar los datos
                            var formData = new FormData();
                            formData.append('BlobCortado', BlobCortado);
                            formData.append('nombreImagen', nombreImagen.trim());
                            formData.append('area', area.trim());

                            $.ajax({
                                url: '/PanelDeControl_disenador-Industrial/agregarImagen',
                                type: 'POST',
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function(response) {
                                    console.log('Archivo enviado con éxito:', response);
                                    resolve();
                                },
                                error: function(error) {
                                    console.error('Error al enviar el archivo:', error);
                                    reject(error);
                                }
                            });
                        }, 100);
                    });     
                    
                    await new Promise((resolve, reject)=>{
                        cropper.getCroppedCanvas().toBlob(function(blob) {
                            // Convertir el blob en una URL de objeto
                            resolve(blob);
                        });
                    });

                    await new Promise((resolve, reject) => {
                        actualizarOpcionesImagenes();
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
                var espacioError = $(this).parent().parent().find('#espacioError');
                espacioError.text('No se ha rellenado la descripcion');
                setTimeout(()=>{
                    espacioError.text('');
                }, 3000)
            }
        }); 
    }
    
        /// FUNCION PARA QUE, DESPUES GUARDAR LA IMAGEN, SE ACTUALICEN EL PANEL DE CONTROL
    function actualizarOpcionesImagenes (){
        $.ajax({
            url: '/PanelDeControl_Ingeniero-Industrial/dataImagenes',
            method: 'POST',
            data: 'ActializarListaImagenes',
            dataType: 'html'
        }).done(function(data){
            $('.Areas').html(data);
        }).fail(function(error){
            console.log('Ocurrio un error en el procedimiento', error);
        });
    }
    
    //EVENTO AL ICONO DE AGREGAR UNA IMAGEN
    $(document).on('click', '.iconoSuma', function(){
        invocarVentanaEmergenteAgregar('NotImage', 'seleccionarTipoDeBusqueda');
        $('#ventanaConfirmacion').dialog('open');
        area = $(this).closest('.Area')[0].id;

        
        $(document).on('click', '#subirLaImagen', function(){
            var elementoFile = $(this).parent().find('#elementoFile');
            elementoFile.click(); // Al hacer clic en el botón, abre el selector de archivos
        });
        
        //Si se eligio pegar una imagen...
        $(document).on('paste','#pegarLaImagen',  function(event) {
            var items = (event.originalEvent.clipboardData || event.clipboardData).items;
            
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    var file = items[i].getAsFile();

                    mostrarOpcionesImagenes(file);
                    revicionYPeticionAlServidorGuargarImagen(area);
                }
            }
        });
    });
    
    //Si se eligio subir una imagen del almacenamiento...
    $(document).on('change', '#elementoFile', function() {
        const file = this.files[0];
        if (file) {
            mostrarOpcionesImagenes(file);

            revicionYPeticionAlServidorGuargarImagen(area);
        }
    });

    //SALIR DE LAS OPCIONES DE CREADO SI SE OPRIME UN BOTON DE SALIDA ()

    $(document).on('click', `.botonEleccion`, function(){
        console.log($('#ventanaConfirmacion'));
        $('#ventanaConfirmacion').css('opacity', '0');
        setTimeout(() => {
            //console.log($('#ventanaConfirmacion').dialog());
            $('#ventanaConfirmacion').dialog('close');
        }, 200);
    });

});