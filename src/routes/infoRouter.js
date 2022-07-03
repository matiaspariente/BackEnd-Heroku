import express from 'express';
import cpus from 'os';
import log4js from '../utils/loggers/log4js.js';

const logger = log4js.getLogger();

const router = express.Router();

const proceso = {
    argumentos: process.argv.slice(2),
    plataforma: process.platform,
    node_version: process.versions.node,
    memory_rss: process.memoryUsage.rss(),
    path_exec: process.execPath,
    processid: process.pid,
    carpeta: process.argv[1],
    cant_proc: cpus.cpus().length 
}

router.get('/',(req,res)=>{
    logger.info(" Ruta /info Metodo Get")
    console.log(" Ruta /info Metodo Get") 
    res.render('info',{ proceso })
})


export default router;