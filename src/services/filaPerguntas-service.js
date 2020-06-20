const axios = require('axios')
const usuarioService = require("./usuario-service")
const FilaPerguntas = require("../models/filaPerguntas-model")
const _ = require("lodash")

exports.obterPerguntasNaoRespondidas = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
        FilaPerguntas.find({
            seller_id: user.id,
            status: 'UNANSWERED'
        }).then(response => {
            res.send(response)
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.buscarEAtualizar = async (req, res) => {
    await usuarioService.buscarUsuarioPorID().then(user => {
        FilaPerguntas.findByIdAndUpdate({
            _id: req.params._id
        }, {
            $set: {
                a: a
            }
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

//ANSWERED
//UNANSWERED