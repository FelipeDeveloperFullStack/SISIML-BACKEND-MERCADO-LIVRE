const express = require('express');
const router = express.Router();
const usuarioService = require("../services/usuario-service");

router.post("/", usuarioService.salvarUsuarioRoute);
router.post('/save_usuario', usuarioService.postUsuario)
router.get("/", usuarioService.listarTodosUsuarios);
router.get("/procurar_usuario_byEmail/:email", usuarioService.getProcurarUsuarioPorEmail)
router.get("/:id", usuarioService.getUserById);
router.get("/get_all/users",usuarioService.getAllUsers)
router.get("/procurar_usuario/documento/:cpf", usuarioService.getProcurarUsuarioPorDocumento)
router.post("/atualizar_tipo_impressao/get01/get02/get03/get04", usuarioService.atualizarTipoImpressao)
router.post("/post/usuario_by_id", usuarioService.getUsuarioByID)
router.post("/post/usuario/procurarCodigoSeguranca", usuarioService.procurarCodigoSeguranca)
router.post("/post/usuario/senha/atualizar_senha", usuarioService.atualizarSenhaUsuario)

module.exports = router;