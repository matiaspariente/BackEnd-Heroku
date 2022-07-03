import express from 'express';
import passport from 'passport'
import log4js from '../utils/loggers/log4js.js';

const logger = log4js.getLogger();

const router = express.Router();

let isLogin = (req, res, next)=>{
    try {
        if(req.isAuthenticated()){
            next();
        }else{
            res.redirect("/errorlogin");
        }
    } catch (error) {
        console.log(error);
    }
}

let isNotLogin = (req, res, next)=>{
    try {
        if(!req.isAuthenticated()){
            next();
        }else{
            res.redirect("/home");
        }
    } catch (error) {
        console.log(error);
    }
}

router.get('/',(req,res)=>{
    logger.info(" Ruta / Metodo Get")
    res.redirect('/login')  
})

router.get('/login',isNotLogin,(req,res)=>{
    logger.info(" Ruta /login Metodo Get") 
    res.render('login',{}) 
})

router.get('/registro',isNotLogin,(req,res)=>{
    logger.info(" Ruta /registro Metodo Get") 
    res.render('registro',{}) 
})

router.get("/home", isLogin, (req,res,next)=>{
    logger.info(" Ruta /home Metodo Get")
    res.render('home', { usuario: req.user} );
});

router.get("/errorlogin", isNotLogin, (req,res,next)=>{
    logger.info(" Ruta /errorlogin Metodo Get")
    res.render("errorlogin",{});
});

router.get("/errorregister", isNotLogin, (req,res,next)=>{
    logger.info(" Ruta /errorregister Metodo Get")
    res.render("errorregister",{});
});

router.get('/logout',(req,res)=>{
    logger.info(" Ruta /logout Metodo Get")
    req.session.destroy()
    res.render("logout", { usuario: req.user });
})

// Métodos post

router.post("/login", passport.authenticate('login', {failureRedirect:"errorlogin", successRedirect:"home"}));

router.post("/registro",  passport.authenticate('register', {failureRedirect:"errorregister", successRedirect:"home"}));


export default router;