const axios = require('axios')
const usuarioService = require('../services/usuario-service')
const constants = require('../constants/constants')


exports.obterDadosCliente = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(resp => {
        axios.get(`${constants.API_MERCADO_LIVRE}/orders/search?seller=${resp.id}&access_token=${resp.accessToken}`).then(orders => {
            let clientes = orders.data.results.filter(function (a) {
                //Evita os IDs duplicados
                return !this[JSON.stringify(a.buyer.id)] && (this[JSON.stringify(a.buyer.id)] = true)

            }, Object.create(null)).map(async value => {

                let vendas = orders.data.results.filter(ordersClient => {
                    return ordersClient.buyer.id === value.buyer.id
                })

                let comprasCliente = vendas.map(value => {
                    return value.order_items.reduce((acumulador, order_item) => {
                        return order_item
                    })
                })

                let valor_venda = comprasCliente.map(valorCorrente => { return valorCorrente.unit_price })

                return await axios.get('https://api.mercadolibre.com/users/' + value.buyer.id).then(resp => {
                    var dadosClient = {
                        id: value.buyer.id,
                        nickname: value.buyer.nickname,
                        primeiro_nome: value.buyer.first_name,
                        last_name: value.buyer.last_name,
                        tipo_documento: value.buyer.billing_info.doc_type,
                        documento: value.buyer.billing_info.doc_number === undefined ||
                            value.buyer.billing_info.doc_number === null ? 'Não informado' : value.buyer.billing_info.doc_number,
                        cidade: resp.data.address.city,
                        estado: JSON.parse(JSON.stringify(resp.data.address.state).replace("BR-", "")),
                        totalCompras: valor_venda.reduce((acumulador, valorCorrent) => { return acumulador + valorCorrent }).toFixed(2),
                        quantidadeCompras: valor_venda.length,
                        data_hora: value.date_closed,
                        compras_cliente: comprasCliente
                    }
                    return dadosClient
                }).catch(err => res.send(err))
            })

            Promise.all(clientes).then((resultado) => {
                res.send(resultado).status(200)
            })

        }).catch(err => {
            res.send({ mensagem: "Houve um erro ao buscar todas as vendas realizadas: " + err })
        })
    })
}