const AtividadeDiariaModel = require('../models/atividadeDiaria-model')
const usuarioService = require('../services/usuario-service')

exports.save = async (req, res) => {
    AtividadeDiariaModel.find({ usuario: req.body.usuario }).then(atividade => {
        //SE CASO O USUÁRIO NÃO TIVER NENHUM REGISTRO DE ATIVIDADE DIÁRIA, SALVA UM NOVO REGISTRO
        if (atividade.length === 0) {
            let atividadeDiaria = AtividadeDiariaModel(req.body)
            atividadeDiaria.save().then(response => {
                res.status(200).send(response)
            }).catch(err => res.status(401).send(err))
        //CASO JÁ TIVER, ATUALIZA.    
        } else if (atividade.length > 0) {
            AtividadeDiariaModel.findOneAndUpdate({ usuario: req.body.usuario }, {
                $set: {
                    qtdeVendasDiaria: req.body.qtdeVendasDiaria,
                    qtdePerguntasDiaria: req.body.qtdePerguntasDiaria,
                    faturamentoDiario: req.body.faturamentoDiario.toFixed(2),
                    ticketMedioDiario: req.body.ticketMedioDiario.toFixed(2),
                    data: req.body.data
                }
            }).then(response => {
                res.status(200).send(response)
            }).catch(err => res.status(401).send(err))
        }
    })
}

exports.findActivityByUser = async (req, res) => {
    await AtividadeDiariaModel.find({usuario: req.body.userId}).then(response => {
        res.status(200).send(response)
    }).catch(err => res.status(401).send(err))
}

