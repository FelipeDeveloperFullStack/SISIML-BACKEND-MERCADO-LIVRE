const express = require('express')
const router = express.Router()
const vendasService = require('../services/vendas-service')

router.get('/getTotalDeVendas/:userId', vendasService.obterTotalDeVendas)  //NÃO ESTÁ SENDO USADO - REVER
router.get('/getVendasConcluidas/get01/get02/:userId', vendasService.obterVendasConcluidas)
router.get('/getVendasPendentes/get01/get02/get03/:userId', vendasService.obterVendasPendentes)
router.get('/getVendasEmTransito/get01/get02/get03/get04/get05/:userId', vendasService.obterVendasEmTransito)
//router.get('/getVendasAEnviar/get01/get02/get03/get04/get05/:userId', vendasService.obterVendaProntoParaEnviar)

router.get('/getTotalVendas/get01/get02/get03/get04/get05/get06/:userId', vendasService.obterTotalVendas) //NÃO ESTÁ SENDO USADO - REVER
router.get('/getTotalVendasEmTransito/get01/get02/get03/get04/get05/get06/get07/:userId', vendasService.obterTotalVendasEmTransito)
router.get('/getTotalVendasAEnviar/get01/get02/get03/get04/get05/get06/get07/get08/:userId', vendasService.obterTotalVendasAEnviar)
router.get('/getTotalVendasPendentes/get01/get02/get03/get04/get05/get06/get07/get08/get09/:userId', vendasService.obterTotalVendasPendentes)
router.get('/gerarEtiquetaEnvio/get01/get02/get03/get04/get05/get06/get07/get08/get09/get10/:shipping_id/:userId', vendasService.gerarEtiquetaEnvio)
router.post('/gerarEtiquetaEnvioMesmoPLP/get01/get02/get03/get04/get05/get06/get07/get08/get09/get10/get11/get12/:userId', vendasService.gerarEtiquetaEnvioMesmaPLP)
router.post('/getTotalMessagensNaoLidas/post01/post02/post03/post04/post05/post06/post07/post08/post09/post10/post11/post12/post13/', vendasService.obterQuantidadeDeMensagensNaoRespondidas)
router.put('/markAsReadMessage/put01/put02/put03/put04/put05/put06/put07/put08/put09/put10/put11/put12/put13/put14', vendasService.markAsReadMessage)
router.post('/sendMessage/post01/post02/post03/post04/post05/post06/post07/post08/post09/post10/post11/post12/post13/post14/post15/', vendasService.sendMessage)
router.post('/dadosGraficoAnual/post01/post02/post03/post04/post05/post06/post07/post08/post09/post10/post11/post12/post13/post14/post15/get16/get17', vendasService.dadosGraficoAnual)


module.exports = router