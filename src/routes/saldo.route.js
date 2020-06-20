const express = require('express')
const router = express.Router()
const saldoService = require('../services/saldo-service')


router.get('/:userId', saldoService.obterSaldo);

module.exports = router