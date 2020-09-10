const express = require('express')
const router = express.Router()
const clientService = require('../services/cliente-service')

router.get('/:userId', clientService.obterDadosCliente)
router.put('/salvar-cliente-bd', clientService.salvarDadosClientesBD)
router.post('/buscar-pelo-id', clientService.buscarPeloId)

module.exports = router