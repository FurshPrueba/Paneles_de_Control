"use strict"

$(document).ready(function () {
    var version;
    var gama;
    var nombrePasosVersion;
    var nombreOrdenPasosVersion;
    var nombreAreasVersion;
    var nombreOrdenAreasVersion;
    
    function llamarVersionPestaña(versionDuplicada, Gama){
        nombrePasosVersion = `Pasos_${versionDuplicada.trim()}_${Gama.trim()}`;
        nombreOrdenPasosVersion = `OrdenPasos_${versionDuplicada.trim()}_${Gama.trim()}`;
        nombreAreasVersion = `Areas_${versionDuplicada.trim()}_${Gama.trim()}`;
        nombreOrdenAreasVersion = `OrdenAreas_${versionDuplicada.trim()}_${Gama.trim()}`;

        var datos = {
            nombrePasosVersion: nombrePasosVersion,
            nombreOrdenPasosVersion: nombreOrdenPasosVersion,
            nombreAreasVersion: nombreAreasVersion,
            nombreOrdenAreasVersion: nombreOrdenAreasVersion,
            versionDuplicada: versionDuplicada,
            gama: Gama,
        }

        $.ajax({
            url: '/PanelDeControl_Disenador-Industrial/dataDuplicar',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function(response) {
                $(".Areas").html(response);
                $(".selectorVersiones").addClass("invisible");
                $("#listaAreas").removeClass("invisible");
                //mostrar botones de aceptar o guardar
                $("#areaBotonesV").css("display", "inline-flex")

            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                // Manejar el error, por ejemplo, mostrar un mensaje al usuario
            }
        });
    }

    $(document).on("click", ".iconoDuplicar", function () {
        version = $(this).parent().parent()[0].id;
        gama = $(this).closest(".selectorVersiones")[0].id;
        llamarVersionPestaña(version, gama);
    });
});