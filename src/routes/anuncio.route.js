'use strict'

const express = require('express');
const router = express.Router();
const anuncioService = require('../services/anuncio-service');

router.get('/obter_atributos_por_categoria/:categoria/get01/get02/:userId', anuncioService.obterAtributosPorCategoria)
router.get('/total_status/get01/:userId', anuncioService.totalStatusAnuncios)
router.get('/:offset/:status/:userId', anuncioService.listarTodosAnuncio);
router.get('/:titulo', anuncioService.listarTodosAnuncio)
router.get('/obterValorDoCustoFreteGratisPorAnuncio/get/anuncio/custo/:item_id/:userId', anuncioService.obterValorDoCustoFreteGratisPorAnuncio)
router.get('/obter_categoria/get/anuncio/:itemId/:userId', anuncioService.getCategoria)
router.get('/copiar_anuncio_por_id/copy/anuncio/get01/get02/get03/:itemId/:userId', anuncioService.copiarAnuncioPorID)

router.put('/update_price/put01/:userId', anuncioService.updatePrice)
router.put('/update_status/put01/put02/:userId', anuncioService.updateStatus)
router.put('/update_title/put01/put02/put03/:userId', anuncioService.updateTitle)
router.put('/update_shipping/put01/put02/put03/put04/:userId', anuncioService.updateShipping)
router.post('/update_listing_type/put01/put02/put03/put04/put05/:userId', anuncioService.updateListingType)
router.put('/update_retirar_pessoalmente/put01/put02/put03/put04/put05/put06/:userId', anuncioService.updateRetirarPessoalmente)
router.put('/update_available_quantity', anuncioService.updateAvailableQuantity)
router.put('/update_description/put01/put02/put03/put04/put05/put06/put07/:userId', anuncioService.updateDescription)
router.put('/update_garantia/put01/put02/put03/put04/put05/put06/put07/put08/:userId', anuncioService.updateGarantia)
router.put('/update_disponibilidade_estoque/put01/put02/put03/put04/put05/put06/put07/put08/put09/:userId', anuncioService.updateDisponibilidadeEstoque)

router.put('/update_condicao/put01/put02/put03/put04/put05/put06/put07/put08/put09/put10/:userId', anuncioService.updateCondicao)
router.put('/update_atributos/put01/put02/put03/put04/put05/put06/put07/put08/put09/put10/put11/:userId', anuncioService.updateAtributos)
router.put('/update_video_youtube/put01/put02/put03/put04/put05/put06/put07/put08/put09/put10/put11/put12/:userId', anuncioService.updateVideoYouTube)
router.post('/obter_imagem_site/put01/put02/put03/put04/put05/put06/put07/put08/put09/put10/put11/put12/post13/:userId', anuncioService.obterImagemSite)
router.put('/update_imagem_variation/put01/put02/put03/put04/put05/put06/put07/put08/put09/put10/put11/put12/post13/put14/:userId', anuncioService.updateImagemVariation)
router.post('/salvar-anuncio-bd', anuncioService.salvarDadosAnuncioBD)
router.post('/buscar-anuncio-por-id/bd', anuncioService.buscarPeloId)




module.exports = router;
