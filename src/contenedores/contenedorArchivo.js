import fs from 'fs';
import __dirname from '../utils.js';

export default class ContenedorArchivo{ // contenedor Archivos
    constructor(archivo){
        this.archivo = archivo;
    }

    async  leerArchivo(){
        try{
            if(fs.existsSync(__dirname+this.archivo)){
                let content = JSON.parse(fs.readFileSync(__dirname+this.archivo,'utf-8'));
                return content;
            }
            else{
                return[];
            }
        } catch (error){
            console.log(error);
        }
    }

    async guardarArchivo(content){
        try {
            fs.writeFileSync(__dirname+this.archivo,JSON.stringify(content),'utf-8');
            return true;
        } catch (error) {
            console.log(error);
        }
    }
}