const axios = require('axios')
const MensagemPosVendaModel = require("../models/mensagemPosVenda-model")

const saveAndUpdate = async (req, res) => {
    console.log(req.body.msg.userId)
    MensagemPosVendaModel.findOne({ userId: req.body.msg.userId }).then(async response => {
        if(response === null){
            let mensagemPosVenda = new MensagemPosVendaModel(req.body.msg)
            await mensagemPosVenda.save().then(response => {
                console.info("[MENSAGEM DO SISTEMA] - Mensagem de pos venda salvo no banco de dados!")
                res.status(200).send("OK!")
            }).catch(err => res.send(err))
        }else{
            MensagemPosVendaModel.findOneAndUpdate({ userId: req.body.msg.userId }, {
                $set: {
                    isHabilitarEnvioCompraRealizada: req.body.msg.isHabilitarEnvioCompraRealizada,
                    mensagemCompraRealizada: req.body.msg.mensagemCompraRealizada,
                    isHabilitarEnvioProdutoEmTransito: req.body.msg.isHabilitarEnvioProdutoEmTransito,
                    mensagemProdutoEmTransito: req.body.msg.mensagemProdutoEmTransito,
                    isHabilitarEnvioProntoParaRetirarCorreios: req.body.msg.isHabilitarEnvioProntoParaRetirarCorreios,
                    mensagemProntoParaRetirarCorreios: req.body.msg.mensagemProntoParaRetirarCorreios,
                    isHabilitarEnvioProdutoEntregue: req.body.msg.isHabilitarEnvioProdutoEntregue,
                    mensagemProdutoEntregue: req.body.msg.mensagemProdutoEntregue,
                }
            }).then(response => {
                console.info("[MENSAGEM DO SISTEMA] - Mensagem de pos venda atualizada no banco de dados!")
                res.status(200).send("OK")
            }).catch(err => res.send(err))
        }
    }).catch(err => res.send(err))
}

const findMessageByUser = async (req, res) => {
    MensagemPosVendaModel.find({ userId: req.body.userId }).then(response => {
        res.send(response)
    }).catch(err => res.send(err))
}

module.exports = {
    saveAndUpdate,
    findMessageByUser
}