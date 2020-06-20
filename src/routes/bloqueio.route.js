const express = require('express')
const router = express.Router()
const bloqueioService = require('../services/bloqueio-service')

//PERGUNTAS
router.post('/', bloqueioService.salvarUsuarioListaNegraPerguntas)
router.get('/', bloqueioService.listarTodosUsuariosListaNegraPerguntas)
router.delete('/perguntas/:user_id_perguntas/:userId', bloqueioService.removerUsuarioListaNegraPerguntas)
router.delete('/mongo/perguntas/:_id_perguntas', bloqueioService.removerUsuarioBlackListPerguntasBD)
router.get('/nickname/:nickname', bloqueioService.buscarUsuarioPorNickName)
router.post('/salvarUsuarioBlackListPerguntas', bloqueioService.salvarUsuarioBlackListPerguntas)
router.get("/listarUsuarioBlackListPerguntas", bloqueioService.listarUsuarioBlackListPerguntas)
router.get("/buscarUsuarioBlackListPerguntasPorNickNameMongoDB/:nickname", bloqueioService.buscarUsuarioBlackListPerguntasPorNickName)


//COMPRAS
router.post('/salvar_user_black_compras', bloqueioService.salvarUsuarioListaNegraCompras)
router.get('/listar_user_black_compras', bloqueioService.listarTodosUsuariosListaNegraCompras)
router.delete('/compras/:user_id_compras/:userId', bloqueioService.removerUsuarioListaNegraCompras)
router.delete('/mongo/compras/:_id_compras', bloqueioService.removerUsuarioBlackListComprasBD)
router.post('/salvarUsuarioBlackListCompras', bloqueioService.salvarUsuarioBlackListCompras)
router.get("/listarUsuarioBlackListCompras", bloqueioService.listarUsuarioBlackListCompras)
router.get("/buscarUsuarioBlackListComprasPorNickNameMongoDB/:nickname", bloqueioService.buscarUsuarioBlackListComprasPorNickName)

module.exports = router