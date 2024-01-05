"use strict"

$(document).ready(function(){
    var version;
    var gama;
    var nombrePasosVersion;
    var nombreOrdenPasosVersion;
    var nombreAreasVersion;
    var nombreOrdenAreasVersion;

    
    function llamarVersionPestaña(version, Gama){
        nombrePasosVersion = `Pasos_${version.trim()}_${Gama.trim()}`;
        nombreOrdenPasosVersion = `OrdenPasos_${version.trim()}_${Gama.trim()}`;
        nombreAreasVersion = `Areas_${version.trim()}_${Gama.trim()}`;
        nombreOrdenAreasVersion = `OrdenAreas_${version.trim()}_${Gama.trim()}`;
        /*
        var enlace = $('<a>', {
            href: '/PanelDeControl_Disenador-Industrial/vistaAreasImagenes', // La URL a la que apunta el enlace
            target: '_self' // Abre el enlace en una nueva ventana o pestaña
        });    
        $(document.body).append(enlace);
        enlace[0].click(); // Simular clic en el enlace
        enlace.remove();
        */

        var datos = {
            nombrePasosVersion: nombrePasosVersion,
            nombreOrdenPasosVersion: nombreOrdenPasosVersion,
            nombreAreasVersion: nombreAreasVersion,
            nombreOrdenAreasVersion: nombreOrdenAreasVersion,
            version: version,
            gama: Gama,
        }

        $.ajax({
            url: '/PanelDeControl_Disenador-Industrial/dataImagenes',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function(response) {
                $(".Areas").html(response);
                $(".selectorVersiones").addClass("invisible");
                $("#listaAreas").removeClass("invisible");
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                // Manejar el error, por ejemplo, mostrar un mensaje al usuario
            }
        });
    }
    
    $(document).on("click", ".campoVersion", function() {
        version = $(this).parent()[0].id;
        gama = $(this).closest(".selectorVersiones")[0].id
        llamarVersionPestaña(version, gama);
    });
});