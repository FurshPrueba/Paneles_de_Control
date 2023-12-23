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

    //EVENTO AL ICONO DE AGREGAR UNA IMAGEN
    $(document).on('click', '.iconoSuma', function(){
        ventanaEmergente = configurarventanaEmergente(600, 500);
        cerrarVentana(Clicks, ventanaEmergente);
        IDimagenAnterior = $(this).parent()[0].id;
        Clicks = false;
        ventanaEmergente.dialog('open');
        area = $(this).closest('.Area')[0].id;
        invocarVentanaEmergenteAgregar('NotImage', 'seleccionarTipoDeBusqueda', area);
        
        
        $(document).on('click', '#subirLaImagen', function(){
            var elementoFile = $(this).parent().find('#elementoFile');
            elementoFile.click(); // Al hacer clic en el botón, abre el selector de archivos
        });
    });
    
    //Si se eligio pegar una imagen...
    $(document).on('paste','#pegarLaImagen',  function(event) {
        var items = (event.originalEvent.clipboardData || event.clipboardData).items;
        if(items.length !== 0){
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    var file = items[i].getAsFile();

                    //Destruir la ventana para crear el siguiente paso
                    ventanaEmergente.dialog('close');
                    ventanaEmergente.dialog('destroy');
                    $('#contenidoVentanaConfirmacion').html("");
                    ventanaEmergente = configurarventanaEmergente(700, 700);
                    
                    ventanaEmergente.dialog('open');

                    cerrarVentana(Clicks, ventanaEmergente); //dejar el evento para pode cerrar a ventana
                    mostrarOpcionesImagenes(file, area, 'CorteIMG');// Mostrar las opciones de las imagenes (el contenido de la ventana)
                    revicionYPeticionAlServidorGuargarImagen (area, Clicks,BlobCortado, IDimagenAnterior, ventanaEmergente);// Revicion por si se oprime el el boton de guardar
                    
                    //cerrarVentanaSegunda()
                }
            }
        }
    });
    
    //SALIR DE LAS OPCIONES DE CREADO SI SE OPRIME UN BOTON DE SALIDA ()
    
    //Si se eligio subir una imagen del almacenamiento...
    $(document).on('change', '#elementoFile', function() {
        cerrarVentana(Clicks, ventanaEmergente);
        ventanaEmergente.dialog('open');
        const file = this.files[0];
        if (file) {
            //Destruir la ventana para crear el siguiente paso
            ventanaEmergente.dialog('close');
            ventanaEmergente.dialog('destroy');
            $('#contenidoVentanaConfirmacion').html("");
            ventanaEmergente = configurarventanaEmergente(600, 650);

            ventanaEmergente.dialog('open');

            mostrarOpcionesImagenes(file, area, 'CorteIMG');
            revicionYPeticionAlServidorGuargarImagen (area, Clicks,BlobCortado, IDimagenAnterior, ventanaEmergente);     
        }
    });
});