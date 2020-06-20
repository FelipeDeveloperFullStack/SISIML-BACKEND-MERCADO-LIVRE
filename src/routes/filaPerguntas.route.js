const express = require('express')
const router = express.Router()
const filaPerguntas = require('../services/filaPerguntas-service')

router.get('/fila_perguntas/:userId', filaPerguntas.obterPerguntasNaoRespondidas)

module.exports = router