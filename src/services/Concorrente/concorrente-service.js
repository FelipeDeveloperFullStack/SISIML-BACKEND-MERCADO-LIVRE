const axios = require('axios')
const cheerio = require('cheerio')
const ConcorrenteModel = require('../../models/concorrente/concorrente-model')

exports.saveConcorrente = async (req, res) => {
    try {
        ConcorrenteModel.find({nickName: req.body.nickName}).then(response => {
             //SE CASO NÃO TIVER NENHUM REGISTRO, SALVA UM NOVO.
            if(response.length === 0){
                const concorrenteModel = new ConcorrenteModel(req.body)
                concorrenteModel.save().then(responseModel => {
                    res.status(200).send(responseModel)
                }).catch(error => res.send(error))
            }else{
                //CASO JÁ TIVER, ATUALIZA. 
                ConcorrenteModel.findOneAndUpdate({nickName: req.body.nickName}, {
                    $set: req.body
                }).then(response => {
                    res.status(200).send(response)
                }).catch(error => res.send(error))
            }
        })
    } catch (error) {
        res.send(error)
    }
}

exports.listarConcorrentePorIdUsuario = async (req, res) => {
    try {
        ConcorrenteModel.find({id_usuario: req.params.userId}).then(response => {
            res.status(200).send(response)
        }).catch(error => res.send(error))
    } catch (error) {
        res.send(error)
    }
}

exports.getConcorrente = async (req, res) => {
    await axios.get(`https://www.mercadolivre.com.br/perfil/${req.body.nickName}`).then(async response => {
        let $ = cheerio.load(response.data)
        let totalVendas = $('#profile > div > div.main-wrapper > div.content-wrapper > div.seller-info > div:nth-child(1) > p > span > span').text()
        let reputacao = $('#profile > div > div.main-wrapper > div.content-wrapper > div.seller-info > div:nth-child(1) > p > span').text()
        let tempoEmVenda = $('#profile > div > div.main-wrapper > div.content-wrapper > div.store-info > div:nth-child(2) > div > p > span').text()
        let qualidadeAtendimento = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div:nth-child(1) > div.metric__description > h2').text()
        let qualidadeAtendimentoCompradores = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div:nth-child(1) > div.metric__description > p > span').text()

        let qualidadeEntrega = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div.metric.metric--last > div.metric__description > h2').text()
        let possuiAtraso = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div.metric.metric--last > div.metric__description > p').text()

        let totalFeedback = $("#profile > div > div.main-wrapper > div.inner-wrapper > section > div.buyers-feedback__wrapper > span").text()
        let feedbackBom = $('#feedback_good').eq(0).text()
        let feedbackRegular = $('#feedback_good').eq(1).text()
        let feedbackRuim = $('#feedback_good').eq(2).text()
        let mercadoLider = $('#profile > div > div.main-wrapper > div.content-wrapper > div.seller-info > div.message > div > p').text()
        let mensagemMercadoLider = $('#profile > div > div.main-wrapper > div.content-wrapper > div.seller-info > div.message > div > span').text()
        let localizacao = $('#profile > div > div.main-wrapper > div.content-wrapper > div.location__wrapper > p').text()   

        let promiseConcorrente = new Promise(async (resolve, reject) => {
            let temp = []
            await axios.get(`https://api.mercadolibre.com/sites/MLB/search?nickname=${req.body.nickName}`).then(async response => {
                if (response.data.results.length !== 0) {

                    let totalVenda = response.data.results.map(result => {
                        return result.price * result.sold_quantity
                    })
                    let quantidadeVendas = response.data.results.map(result => {
                        return result.sold_quantity
                    })

                    /*
                    let quantidadeTotalVendas = quantidadeVendas.reduce((soma, valorCorrente) => {
                        return soma + valorCorrente
                    })
                    */
                    let soma = totalVenda.reduce((soma, valorCorrente) => {
                        return soma + valorCorrente
                    })

                    /*try {
                        let visitas = response.data.results.map(async result => {
                            return await axios.get(`https://api.mercadolibre.com/visits/items?ids=${result.id}`).then(resp => {
                                return Object.values(resp.data).reduce((acumulador, valorCorrente) => { return valorCorrente })
                            }).catch(error => reject({ errorMessage: "Houve um erro na API de visitas! " + error }))
                        })

                        Promise.all(visitas).then(async resp => {
                            let totalVisitas = resp.reduce((acumulador, valorCorrente) => { return acumulador + valorCorrente })
                            console.log('Total de visitas: ' + totalVisitas)
                            temp.push({ totalVisitas: totalVisitas })
                        }).catch(error => reject({ errorMessage: "Houve um erro no reduce de visitas! " + error }))
                    } catch (error) {
                        reject({ errorMessage: "Caiu no Catch de visitas: " + error })
                    }*/

                    let faturamento = soma.toLocaleString("pt-BR", { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })

                    await axios.get(`https://api.mercadolibre.com/users/${response.data.seller.id}`).then(resp => {
                       /*console.log('Transações:')
                        console.log('Total de transações canceladas: ' + resp.data.seller_reputation.transactions.canceled)
                        console.log('Total de transações completadas: ' + resp.data.seller_reputation.transactions.completed)
                        console.log('-------------------------------------------------')
                        console.log('Classificações')
                        console.log('Classificação negativa: ' + (resp.data.seller_reputation.transactions.ratings.negative * 100).toFixed(0) + '%')
                        console.log('Classificação neutra: ' + (resp.data.seller_reputation.transactions.ratings.neutral * 100).toFixed(0) + '%')
                        console.log('Classificação positiva: ' + (resp.data.seller_reputation.transactions.ratings.positive * 100).toFixed(0) + '%')
                        console.log('Perfil: ' + resp.data.permalink)*/

                        let concorrenteObj = {
                            totalTransacoesCanceladas: resp.data.seller_reputation.transactions.canceled,
                            totalTransacoesCompletadas: resp.data.seller_reputation.transactions.completed,
                            classificacaoNegativa: (resp.data.seller_reputation.transactions.ratings.negative * 100).toFixed(0) + '%',
                            classificacaoNeutra: (resp.data.seller_reputation.transactions.ratings.neutral * 100).toFixed(0) + '%',
                            classificacaoPositiva: (resp.data.seller_reputation.transactions.ratings.positive * 100).toFixed(0) + '%',
                            perfil: resp.data.permalink,
                            nickName: resp.data.permalink.replace("http://perfil.mercadolivre.com.br/", ""),
                            reputacao: reputacao,
                            tempoEmVenda: tempoEmVenda,
                            qualidadeAtendimento: qualidadeAtendimento,
                            qualidadeAtendimentoCompradores: qualidadeAtendimentoCompradores.replace("Ver detalhes", ""),
                            qualidadeEntrega: qualidadeEntrega,
                            possuiAtraso: possuiAtraso,
                            feedbackBom: feedbackBom,
                            qtdeFeedbackBom: feedbackBom.replace("Bom (", "").replace(")", ""),
                            feedbackRegular: feedbackRegular,
                            qtdeFeedbackRegular: feedbackRegular.replace("Regular (", "").replace(")", ""),
                            feedbackRuim: feedbackRuim,
                            qtdeFeedbackRuim: feedbackRuim.replace("Ruim (", "").replace(")", ""),
                            totalFeedback: totalFeedback,
                            ticketMedio: ((soma / totalVendas).toLocaleString("pt-BR", { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })),
                            totalVendas: totalVendas,
                            faturamento: faturamento.replace("R$", "").trim(),
                            mercadoLider: mercadoLider,
                            mensagemMercadoLider: mensagemMercadoLider,
                            localizacao: localizacao
                        }

                        /*console.log('-------------------------------------------------')
                        console.log('Reputação: ' + reputacao)
                        console.log('-------------------------------------------------')
                        console.log("Tempo de vendas: " + tempoEmVenda)
                        console.log("Qualidade no atendimento: " + qualidadeAtendimento)
                        console.log('Qualidade no atendimento para os compradores: ' + qualidadeAtendimentoCompradores)
                        console.log('Qualidade da entrega: ' + qualidadeEntrega)
                        console.log("Possui atraso na entrega: " + possuiAtraso)
                        console.log('-------------------------------------------------')
                        console.log('Feedback: ' + feedback)
                        console.log('Total de Feedback: ' + totalFeedback)
                        console.log('-------------------------------------------------')
                        console.log('Ticket médio: ' + (soma / totalVendas).toLocaleString("pt-BR", { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' }))
                        console.log('Total de vendas: ' + totalVendas)
                        console.log("Total de faturamento: " + faturamento)*/

                        resolve({ temp: concorrenteObj })

                    }).catch(error => reject({ errorMessage: "Houve um erro ao tentar buscar por id do usuário " + error }))


                } else {
                    reject({ errorMessage: "O usuário em questão não possui nenhum anúncio ativo para análise das métricas." })
                }
            })
            promiseConcorrente.then(response => {
                res.status(200).send(response.temp)
            })
        }).catch(error => res.send("Houve um erro ao tentar buscar por nickname " + error))
    }).catch(error => res.send("Houve um erro ao tentar buscar por nickname " + error))
}