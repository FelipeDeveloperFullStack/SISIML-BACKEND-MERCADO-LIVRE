const express = require('express')
const router = express.Router()
const rastreioService = require('../services/rastreio-service')

router.get('/:codigo', rastreioService.obterRastreamentoCorreios)


module.exports = router