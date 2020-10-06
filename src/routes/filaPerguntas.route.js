const express = require('express')
const router = express.Router()
const filaPerguntas = require('../services/filaPerguntas-service')

router.get('/fila_perguntas/:userId', filaPerguntas.obterPerguntasNaoRespondidas)
router.post('/fila_perguntas/obter_dados_ml', filaPerguntas.obterDadosMercadoLivre)

module.exports = router