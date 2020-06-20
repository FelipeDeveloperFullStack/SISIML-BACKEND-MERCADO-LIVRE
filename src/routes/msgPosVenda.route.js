const express = require('express')
const router = express.Router()
const msgPosVenda = require('../services/msgPosVenda-service')


router.post('/', msgPosVenda.saveAndUpdate)
router.post('/find', msgPosVenda.findMessageByUser)

module.exports = router