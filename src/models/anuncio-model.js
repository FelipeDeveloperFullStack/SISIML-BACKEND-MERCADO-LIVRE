'use strict'

const mongoose = require('mongoose');

const anuncioModel = mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    preco: {
        type: Number,
        required: true
    },
    descricao: {
        type: String,
        required: false,
        trim: true
    }
});

module.exports = mongoose.model('Anuncio', anuncioModel);
