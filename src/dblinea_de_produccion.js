const sqlite3 = require('sqlite3').verbose();
const colors = require('colors');

const db = new sqlite3.Database('lineadeproduccion(lote).db', (err)=>{
    if(err){
        return console.log("Error la conectar la base de datos".red);
    }

    console.log("Se conecto exitosamente la base de datos".bgGreen);
});

module.exports = db;