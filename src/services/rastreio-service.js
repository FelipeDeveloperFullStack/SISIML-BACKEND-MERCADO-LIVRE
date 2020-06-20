const { rastro } = require('rastrojs');
const util = require('../helpers/util')

exports.obterRastreamentoCorreios = async (req, res) => {
    Promise.resolve(rastro.track(req.params.codigo)).then(response => {
        if (response[0].error === 'not_found') {
            res.send(
                {
                    message: "Código " + response[0].code + " não encontrado na base de dados do correios!",
                    error: '404'
                }
            )
        } else {
            let rastreio = {
                code: response[0].code,
                tracks: getTracks(response[0].tracks),
                isDelivered: response[0].isDelivered,
                postedAt: util.formatarDataHora(JSON.stringify(response[0].postedAt)),
                updatedAt: util.formatarDataHora(JSON.stringify(response[0].updatedAt))
            }
            res.send(rastreio)
        }
    }).catch(error => res.send(error))
}


let getTracks = (tracks) => {
    return tracks.map(tr => {
        let track = {
            locale: tr.locale,
            status: tr.status,
            observation: tr.observation,
            trackedAt: util.formatarDataHora(JSON.stringify(tr.trackedAt))
        }
        return track
    })
}
