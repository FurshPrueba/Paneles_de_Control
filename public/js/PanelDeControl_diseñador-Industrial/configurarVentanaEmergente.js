$(document).ready(function(){
    var dialogo = $('#ventanaConfirmacion').dialog({
        autoOpen: false,
        width: 600,
        height: 500,
        modal: true,
        draggable: false,
        resizable: false,
        open: function(event, ui) {
            console.log("ABIERTO"); // Verificar isOpen() al abrirse completamente
            console.log($('#ventanaConfirmacion').dialog('isOpen')); // Verificar isOpen() al abrirse completamente
        },
        close: function(event, ui) {
            console.log("CERRADO"); // Verificar isOpen() al abrirse completamente
            console.log($('#ventanaConfirmacion').dialog('isOpen')); // Verificar isOpen() al cerrarse completamente
        }
    });
});