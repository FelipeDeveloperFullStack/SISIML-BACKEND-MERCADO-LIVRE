const express = require('express')
const router = express.Router()
const clientService = require('../services/cliente-service')

router.get('/:userId', clientService.obterDadosCliente)

module.exports = router