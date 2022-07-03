import express from 'express';
import apiProductosRouter from './routes/apiProductos.js';
import apiCartsRouter from './routes/apiCarts.js';
import apiProductosTestRouter from './routes/apiProductosTest.js';
import viewsRouter from './routes/viewsRouter.js';
import infoRouter from './routes/infoRouter.js';
import apiRandomRouter from './routes/apiRandom.js';
import { Server } from 'socket.io';
import __dirname from './utils.js';
import {schema, normalize, denormalize} from 'normalizr'
import fs from 'fs';
import expressSession from 'express-session'
import path from 'path'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import usersSchema from "./config.js"
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs"
import dotenv from 'dotenv'
import minimist from "minimist";
import cpus from 'os';
import cluster from 'cluster';
import gzip from 'compression';
import log4js from './utils/loggers/log4js.js';

const logger = log4js.getLogger('loggerFileWarning');

let args = process.argv.slice(2);

let options = {
    default:{
        port: process.env.PORT || 8050,
        modo:"fork"
    },
}

let argv = minimist(args,options)

const model = mongoose.model('users', usersSchema)

const app= express();
const PORT = argv.port
const MODO = argv.modo
const numCPUs = cpus.cpus().length
let io = null


if (MODO === "cluster") {
    if (cluster.isMaster) {
        for (let index = 0; index < numCPUs; index++) {
            cluster.fork()

        }
    } else {
        const server = app.listen(PORT,()=>console.log(`listening on ${PORT}`))
        io = new Server(server);

        const chatLog = JSON.parse(fs.readFileSync(__dirname+'/data/chat.json','utf-8'));


        io.on('connection',socket=>{ // escucho conexiones nuevas
            socket.on('start',data=>{ //espero mensaje del fetch del primer GET para cargar tabla al conectar
                io.emit('log',data) // envio la data obtenida con el metodo GET 
            })
            socket.on('message',data=>{ //espero mensajes nuevos del chat
                if(data){ // este if es para evitar el primer mensaje  luego de ser ingresado el mail en la notificacion, es para poder mostrar el chat completo al iniciar la conexion si no pushearia basura al log
                    const messageCurrent = {
                        author:{
                        id: data.id,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        edad: data.edad,
                        alias: data.apellido,
                        avatar: data.avatar
                        },
                        text: data.text
                    }
                    chatLog.messages.push(messageCurrent);
                    fs.writeFileSync(__dirname+'/data/chat.json',JSON.stringify(chatLog),'utf-8');
                }
                const schemaAuthor = new schema.Entity('author', {}, { idAttribute: 'id' });
                const schemaChat = new schema.Entity('chat', { messages: [{author: schemaAuthor}] });
                let chatNormalizada = normalize(chatLog,schemaChat)
                let chatDesnormalizada = denormalize(chatNormalizada.result,schemaChat,chatNormalizada.entities)
                let compresion = 100 - (JSON.stringify(chatNormalizada).length*100 / JSON.stringify(chatDesnormalizada).length)
                io.emit('chat',chatLog,compresion) // lo envio a los clientes
            })
        })


    }

}else{
    const server = app.listen(PORT,()=>console.log(`listening on ${PORT}`))
    io = new Server(server);
    const chatLog = JSON.parse(fs.readFileSync(__dirname+'/data/chat.json','utf-8'));
    io.on('connection',socket=>{ // escucho conexiones nuevas
        socket.on('start',data=>{ //espero mensaje del fetch del primer GET para cargar tabla al conectar
            io.emit('log',data) // envio la data obtenida con el metodo GET 
        })
        socket.on('message',data=>{ //espero mensajes nuevos del chat
            if(data){ // este if es para evitar el primer mensaje  luego de ser ingresado el mail en la notificacion, es para poder mostrar el chat completo al iniciar la conexion si no pushearia basura al log
                const messageCurrent = {
                    author:{
                    id: data.id,
                    nombre: data.nombre,
                    apellido: data.apellido,
                    edad: data.edad,
                    alias: data.apellido,
                    avatar: data.avatar
                    },
                    text: data.text
                }
                chatLog.messages.push(messageCurrent);
                fs.writeFileSync(__dirname+'/data/chat.json',JSON.stringify(chatLog),'utf-8');
            }
            const schemaAuthor = new schema.Entity('author', {}, { idAttribute: 'id' });
            const schemaChat = new schema.Entity('chat', { messages: [{author: schemaAuthor}] });
            let chatNormalizada = normalize(chatLog,schemaChat)
            let chatDesnormalizada = denormalize(chatNormalizada.result,schemaChat,chatNormalizada.entities)
            let compresion = 100 - (JSON.stringify(chatNormalizada).length*100 / JSON.stringify(chatDesnormalizada).length)
            io.emit('chat',chatLog,compresion) // lo envio a los clientes
        })
    })
}

dotenv.config()

const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

app.set("views", path.join(__dirname, 'views', 'ejs'));
app.set("view engine", "ejs");

// ------------------------ PASSPORT-----------------------------------

passport.use('login', new LocalStrategy(async(username, password, done)=>{
    try {
        let user = await model.find({username: username});
        //let user = usuarios.find(user => user.username == username);
        if(!user.length)return done(null, false);
        bcrypt.compare(password,user[0].password,(err,sonIguales)=>{
            if(err){
                return done(null, false); 
            }
            if(sonIguales) return done(null, user[0]);
            return done(null, false);
        })
    } catch (error) {
        console.log(error);
    }
}));


passport.use('register', new LocalStrategy({
    passReqToCallback: true
},async(req, username, password, done)=>{
    try {
        let usuario = await model.find({username: username});
        //let usuario = usuarios.find(user => user.username == username);
        if(usuario.length) return done(null,false)
        const user = {
            username: username,
            password: password
        }
        bcrypt.genSalt(10, (err,salt) => {
            if(err) {
                return done("password ERROR")
            }
            bcrypt.hash(user.password,salt, null, async(err,hash) => {
                if(err){
                    return done("password ERROR")
                }
                user.password = hash;
                await model.insertMany(user)
                return done(null, user);
            })
        })
    } catch (error) {
        console.log(error);
    }
}));

passport.serializeUser((user, done)=>{
    done(null, user.username);
});

passport.deserializeUser(async(username, done)=>{
    let usuario = await model.find({username: username});
    done(null, usuario[0]);
});

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(expressSession({ // se persiste SESSIONS en Mongo
    store: MongoStore.create({
        //mongoUrl: process.env._MONGO_URL,
        mongoUrl: "mongodb+srv://coderhouse:coderhouse@matiaspariente.qctoeul.mongodb.net/?retryWrites=true&w=majority",
        mongoOptions: advancedOptions
    }),
    //secret: process.env._SESSION_SECRET,
    secret:"secret",
    resave: true,
    cookie: { maxAge: 1000 *60 * 10 },
    saveUninitialized:true
})) 

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname+'/public'))
app.use('/',viewsRouter)
app.use('/info',gzip(),infoRouter)
app.use('/api/productos/',apiProductosRouter)
app.use('/api/carts/',apiCartsRouter)
app.use('/api/productos-test/',apiProductosTestRouter)
app.use('/api/random',apiRandomRouter)
app.use('*',(req,res)=>{
    logger.warn(`Ruta: ${req.originalUrl} No permitida`)
    res.send("Ruta No permitida")
})

export default io;