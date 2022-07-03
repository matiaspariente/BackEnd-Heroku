let socket = io();
let form = document.getElementById('userForm');
let formChat = document.getElementById('chatForm');
let tablaProductos = document.getElementById('tablaProductos');
let formBtn =document.getElementById('formBtn');
let testBtn =document.getElementById('testBtn');
let chatBox = document.getElementById('chatBox');
let chatBtn =document.getElementById('chatBtn');

formBtn.addEventListener('click',(evt)=>{ // espero evento de boton de envio de formulario
    evt.preventDefault();
    let data = new FormData(form);
    let obj = {};
    data.forEach((value,key)=>obj[key]=value); // genero el body correspondiente y ejecuto el metodo post
    fetch('/api/productos/',{
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    })
})


testBtn.addEventListener('click',(evt)=>{ // Boton para obtener productos al azar de la api-test
    evt.preventDefault();
    fetch('/api/productos-test', options) // hago un fetch para atraves del metodo get obtener los productos de la api test creada con faker
    .then(response => response.text())
    .then(data => {
        data = JSON.parse(data)
        for (i = 0; i< data.length; i++){
            fetch('/api/productos/',{ // con los productos aleatorios hago un post a la api de productos para cargarlos
                method:'POST',
                body: JSON.stringify(data[i]),
                headers:{
                    "Content-Type":"application/json"
                }
            })
        }
    });

})

const user="defaultName" // nombre de usuario por defecto
socket.emit('message',null) // envio primer mensaje al servidor, para que me responda con los mensajes del chat hasta el momento

const options = {
    method: "GET"
  }; 

fetch('/api/productos/', options) // hago un fetch para atraves del metodo get obtener los productos cargados hasta el momento al iniciar la conexion con el cliente nuevo
    .then(response => response.text())
    .then(data => {
        socket.emit('start',JSON.parse(data))
    });
    
/*SOCKETS */

socket.on('log',data=>{ // recibo conexion del servidor cuando se ejecuta un POST, DELETE o PUT y modifico la tabla con los nuevos valores.
    let tabla = "<thead><tr><th>ID</th><th>Producto</th><th>Precio</th><th>Foto</th></thead>"
    if(data.error!="no hay productos cargados"){
        data.forEach(log=>{
            tabla +=`<tr><td>${log.id}</td><td>${log.title}</td><td>$${log.price}</td><td><img src="${log.thumbnail}"  alt="${log.thumbnail}"></td></tr>`;
        })
    }
    tablaProductos.innerHTML = tabla;
})

chatBtn.addEventListener('click',(evt)=>{ // evento al presionar el boton enviar del chat, cumple la misma funcion que el enter en el chatbox
    evt.preventDefault();
    let data = new FormData(formChat);
    let obj = {};
    data.forEach((value,key)=>obj[key]=value); // genero el body correspondiente y ejecuto el metodo post
    if(chatBox.value.trim().length>0){//Por lo menos se envia un simbolo
        socket.emit('message',obj)
        chatBox.value="";
    }
})

socket.on('chat', (data,compresion)=>{ // recibo del servidor el array del chat y lo muestro en pantalla
    let messages="";
    let dt = luxon.DateTime.now()
    let messageCompresion = "(Compresión " + compresion.toFixed() + " % )"
    data.messages.forEach(log=>{
        messages = messages + `<p style="color:blue"><b>${log.author.id}</b></p><p style="color:brown">[${dt.toLocaleString(luxon.DateTime.DATE_SHORT)}
             ${dt.toLocaleString(luxon.DateTime.TIME_WITH_SECONDS)}]</p> <p style="color:green"><i>:${log.text}</i></p><img src="${log.author.avatar}" width="30" height="30" alt="${log.author.avatar}"></br>`;
    })
    log.innerHTML=messages;
    compresionText.innerHTML=messageCompresion; 
})


