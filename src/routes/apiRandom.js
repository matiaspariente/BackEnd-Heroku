import express from "express";
import { fork } from 'child_process'
import log4js from '../utils/loggers/log4js.js';

const logger = log4js.getLogger();

const router = express.Router();

/* let child_process = fork("src/child_random.js")


function secundaria() {
    return new Promise((resolve, reject) => {
        child_process.on("message", data =>{  
            resolve({
                result : data
            })
        })
    })
}        


router.get('/', async(req,res)=>{
        logger.info(" Ruta /random Metodo Get")
        if(req.query.cant) child_process.send(req.query.cant)
        else child_process.send(100000000)
        let objeto = await secundaria()
        res.send(objeto.result)     
}) */

export default router;