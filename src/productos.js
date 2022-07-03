export default class Productos { 
    constructor() {
        this.productos = [];
    }
    guardar = (title,price,thumbnail) =>{
            let id = 0;
            if(this.productos.length) id=this.productos[this.productos.length-1].id; // Se asigna id 1 si no hay productos
            const productoActual = { //tomo los valores ingresados
                id:++id,
                title : title,
                price : price,
                thumbnail : thumbnail   
            }   
            this.productos.push(productoActual);// los agrego a productos
            return id //retorno id
    }

    leer = () =>{
        return this.productos //retorno Json de productos
    }

    borrar = (id) =>{
    this.productos = this.productos.filter((productos)=>productos.id != id) // elimino el producto con el id recibido
    }

    modificar(title,price,thumbnail,id){
        this.productos = this.productos.filter((productos)=>productos.id != id) //elimino el producto con el id recibido
        const productoActual = { // guardo el producto con los nuevos valores
            title : title,
            price : price,
            thumbnail : thumbnail,
            id:id
        }   
        this.productos.push(productoActual); // lo agrego a productos
        this.productos.sort((a,b)=>a.id-b.id) // los ordeno por ID
    }
}