"use strict"

const express = require("express");
const passport = require("passport");
const router = express.Router();
require('../config/passport.mercadolivre')(passport);

router.get('/', (req, res, next) => {

    res.status(200).send({mensagem: "Servidor funcionando!"});

});


module.exports = router;