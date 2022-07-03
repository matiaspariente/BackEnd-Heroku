process.on("message",data =>{
    process.send(random(data))
})

function random(data){
    let objeto = {}
    for (let i = 0; i < parseInt(data); i++){
        let clave = Math.floor(Math.random()*1000)+'' 
        if (objeto[`${clave}`]) objeto[`${clave}`]++
        else objeto[`${clave}`] = 1   
    }
    return objeto;
}
