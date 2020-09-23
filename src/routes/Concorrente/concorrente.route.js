const express = require('express')
const router = express.Router()
const concorrenteService = require("../../services/Concorrente/concorrente-service")

router.post('/', concorrenteService.getConcorrente) 
router.post('/save/', concorrenteService.saveConcorrente)
router.get('/:userId', concorrenteService.listarConcorrentePorIdUsuario)
router.post('/remove/concorrente', concorrenteService.removeConcorrente)

module.exports = router
