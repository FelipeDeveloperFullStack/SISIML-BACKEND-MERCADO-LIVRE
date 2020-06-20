const express = require('express')
const router = express.Router()
const atividadeDiariaService = require('../services/atividadeDiaria-service')

router.post("/save", atividadeDiariaService.save)
router.post('/find_by/user', atividadeDiariaService.findActivityByUser)

module.exports = router