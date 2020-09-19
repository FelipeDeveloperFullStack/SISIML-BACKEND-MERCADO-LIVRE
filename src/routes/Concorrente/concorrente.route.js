const express = require('express')
const router = express.Router()
const concorrenteService = require("../../services/Concorrente/concorrente-service")

router.post('/', concorrenteService.getConcorrente) 

module.exports = router
