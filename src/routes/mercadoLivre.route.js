"use strict"

const express = require("express");
const passport = require("passport");
const router = express.Router();
const keys = require('../config/keys');

const meli = require('mercadolibre');

/**
 * @author Felipe M. Santos
 */

router.get('/auth/mercadolibre', passport.authorize('mercadolibre'));

//Retorno de callback do servidor do mercado livre
router.get('/auth/mercadolibre/callback', passport.authorize('mercadolibre', { 
    failureRedirect: '/' 
}), (req, res) => {
        // Redireciona para a página principal do sistema
       //res.redirect("http://localhost:3000/admin/dashboard");
       res.redirect("http://localhost:3000/dashboard/analytics");
    });

router.get('/', ensureAuthenticated, async (req, res) => {
       // console.log("Usuario logado: " + req.user.nickname)
       //await res.send("Usuario logado: " + req.user.nickname);  
    }
);

/** Verifica se o usuário já está autenticado, caso sim, redireciona para a página principal do sistema
  Se não, rediciona para a rota /auth/mercadolibre **/
function ensureAuthenticated(req, res, next){
    /*console.log("\n")
    console.log(req.isAuthenticated())
    console.log("\n")
    if (req.isAuthenticated()) {
        return next();
    };*/
    res.redirect('/auth/mercadolibre');
};




//let meliObject = new meli.Meli(keys.mercadolivre.CLIENT_ID, keys.mercadolivre.CLIENT_SECRET);
//let code = meliObject.getAuthURL('http://localhost:3000')
//console.log(code)

module.exports = router;
