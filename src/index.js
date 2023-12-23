const  express = require('express');
const  body_parser = require('body-parser');
const  ejs = require('ejs-mate');
const  morgan = require('morgan');
const  path = require('path');
const  colors = require('colors');
const  cors = require('cors');

const app = express();


//Configuracion 
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join('public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejs);
app.set('view engine', 'ejs');
app.use(express.json());


//Middlawares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));


//para la ruta de inicio de la palataforma (De prueba y por estandares)
app.get('/', require('./routes/index'));


 //RUTAS PARA EL PANEL DE CONTROL DEL INGENIERO INDUSTRIAL

//para la ruta del panel de control de la linea de produccion
app.get('/PanelDeControl_Ingeniero-Industrial', require('./routes/PanelDeControl_Ingeniero-Industrial/rutaPaneldeControl'));

//para la ruta del panel de control de la linea de produccion
app.post('/PanelDeControl_Ingeniero-Industrial/dataProducto', require('./routes/PanelDeControl_Ingeniero-Industrial/rutaPaneldeControl'));


//la ruta para pedirle al servidor el contenido de la interaccion de la pagina emergente al modificar la linea de produccion, tanto para agregar como para anular un [Producto]
app.post('/PanelDeControl_Ingeniero-Industrial/contenidoVentana', require('./routes/PanelDeControl_Ingeniero-Industrial/rutaPaneldeControl'));

//Opciones de agregado de procesos
    //-aceptar
app.post('/PanelDeControl_Ingeniero-Industrial/agregarProceso', require('./routes/PanelDeControl_Ingeniero-Industrial/panelControl_CrearNuevoProcedimiento.js'));


//Opciones de reemplazar de procesos
    //-aceptar
    app.post('/PanelDeControl_Ingeniero-Industrial/anularProceso', require('./routes/PanelDeControl_Ingeniero-Industrial/panelControl_AnularUnProceso.js'));


//Opciones de borrar de procesos
    //-aceptar
    app.post('/PanelDeControl_Ingeniero-Industrial/borrarProceso', require('./routes/PanelDeControl_Ingeniero-Industrial/panelControl_BorrarUnProceso.js'));

            //RUTAS PARA EL PANEL DE CONTROL DEL DISEÑADOR INDUSTRIAL
            

//para la ruta del panel de control de la linea de produccion
app.get('/PanelDeControl_Disenador-Industrial', require('./routes/PanelDeControl_disenador-Industrial/rutaPaneldeControl.js'));

//la ruta para pedirle al servidor el contenido de la interaccion de la pagina emergente al modificar la linea de produccion, tanto para agregar como para anular un [Producto]
app.post('/PanelDeControl_Disenador-Industrial/contenidoVentana', require('./routes/PanelDeControl_disenador-Industrial/rutaPaneldeControl.js'));

//para la ruta del panel de control de la linea de produccion
app.post('/PanelDeControl_Disenador-Industrial/dataImagenes', require('./routes/PanelDeControl_disenador-Industrial/rutaPaneldeControl.js'));

//para la ruta del panel de control de la linea de produccion
app.post('/PanelDeControl_Disenador-Industrial/cambiar_nombreArea', require('./routes/PanelDeControl_disenador-Industrial/rutaPaneldeControl.js'));


    //IMAGENES
//Opciones de agregado de procesos
    //-aceptar
app.post('/PanelDeControl_Disenador-Industrial/agregarImagen', require('./routes/PanelDeControl_disenador-Industrial/imagenes/panelControl_AgregarImagen.js'));

//Opciones de reemplazar de procesos
    //-aceptar
    app.post('/PanelDeControl_Disenador-Industrial/reorganizarImagenes', require('./routes/PanelDeControl_disenador-Industrial/imagenes/panelControl_reorganizarImagenes.js'));


//Opciones de borrar de procesos
    //-aceptar
    app.post('/PanelDeControl_Disenador-Industrial/borrarImagen', require('./routes/PanelDeControl_disenador-Industrial/imagenes/panelControl_BorrarUnaImagen.js'));


    //AREAS
//Opciones de agregado de procesos
    //-aceptar
    app.post('/PanelDeControl_Disenador-Industrial/agregarArea', require('./routes/PanelDeControl_disenador-Industrial/Areas/panelControl_AgregarArea.js'));



app.listen(app.get('port'), ()=>{
    console.log("Escuchando en el puerto: ".america, app.get('port'));
});