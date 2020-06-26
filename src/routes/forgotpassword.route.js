const express = require("express")
const router = express.Router()
const forgotPasswordSendEmailService = require("../services/forgotPasswordSendEmail-service")

router.post('/', forgotPasswordSendEmailService.sendEmail)

module.exports = router