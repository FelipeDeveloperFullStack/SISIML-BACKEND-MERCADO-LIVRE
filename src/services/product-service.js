'use strict';

const mongoose = require('mongoose');
const Product = require('../models/product-model');
const axios = require("axios");


exports.post = (req, res, next) => {
    let product = new Product(req.body);
    product.save().then(resp => {
        res.status(200).send({
            message: "Produto cadastrado com sucesso"
        });
    }).catch(err => {
        res.status(400).send({
            menssage: "Falha ao cadastrar o produto:",
            error: err
        });
    });
};

exports.put = (req, res, next) => {
    Product.findByIdAndUpdate({
        _id: req.params.id
    }, {
        $set: {
            title: req.body.title,
            price: req.body.price
    }}).then(resp => {
        res.status(200).send({mensagem: "Produto atualizado com sucesso"})
    }).catch(err => {
        res.status(400).send({
            mensagem: "Ops, houve um erro ao atualizar o produto",
            error: err.message
        });
    });
};

exports.listarTodosProdutos = (req, res, next) => {
    Product.find({
        active: true
    }, "title price").then(resp => {
            res.status(200).send(resp);
        }).catch(err => {
            res.status(400).find(err);
        });
}

exports.listarProdutoPorID = (req, res, next) => {
    Product.findById({_id: req.params.id}).then(resp => {
        res.status(200).send(resp);
    }).catch(err => {
        res.status(400).send({message: err.message});
    });
}