"use strict"

const express = require("express");
const productService = require('../services/product-service');
const router = express.Router();

router.post('/', productService.listarTodosProdutos);

module.exports = router;