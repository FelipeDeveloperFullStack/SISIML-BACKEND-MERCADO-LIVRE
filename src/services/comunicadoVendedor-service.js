const axios = require('axios')
const usuarioService = require('../services/usuario-service')

exports.obteComunicadoVendedor = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/communications/notices?limit=20&offset=0&access_token=${user.accessToken}`).then(response => {
            let results = response.data.results.map(result => {
                let dado = {
                    label: result.label,
                    description: result.description,
                    text: result.actions[0].text,
                    link: result.actions[0].link
                }
                return dado
            })
            Promise.all(results).then(comunication => {
                res.send(comunication)
            })
        }).catch(error => res.send(error))
    })
}