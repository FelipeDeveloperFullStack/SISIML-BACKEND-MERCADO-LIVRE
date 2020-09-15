
//Converter date em String
exports.formatarDataHora = (date) => {
    date = date.replace(/"/g, '')
    let formatData = date.substring(0, 10).split('-')
    let hora = date.substring(11, 16)
    let dataHoraFormatada = formatData[2] + '/' + formatData[1] + '/' + formatData[0] + ' as ' + hora
    return dataHoraFormatada
}

/** Return month */
exports.getDateMonthInteger = date => {
    date = date.replace(/"/g, '')
    let formatData = date.substring(0, 10).split('-')
    return formatData[1]
}

exports.getDateMonthString = month => {
    if(month == 01) return 'Janeiro'
    if(month == 02) return 'Fevereiro'
    if(month == 03) return 'Março'
    if(month == 04) return 'Abril'
    if(month == 05) return 'Maio'
    if(month == 06) return 'Junho'
    if(month == 07) return 'Julho'
    if(month == 08) return 'Agosto'
    if(month == 09) return 'Setembro'
    if(month == 10) return 'Outubro'
    if(month == 11) return 'Novembro'
    if(month == 12) return 'Dezembro'
}

exports.formatarDataComTraco = (date) => {
    date = date.replace(/"/g, '')
    let formatData = date.substring(0, 10).split('-')
    let dataHoraFormatada = formatData[2] + '-' + formatData[1] + '-' + formatData[0]
    return dataHoraFormatada
}

exports.formatarDataInverter = (date) => {
    date = date.replace(/"/g, '')
    let formatData = date.substring(0, 10).split('-')
    let dataHoraFormatada = formatData[0] + '-' + formatData[1] + '-' + formatData[2]
    return dataHoraFormatada
}


exports.tratarNumeroCelularComDDD = (ddd, numero) => {
    if (ddd != null) ddd = ddd.replace(' ', '')
    if (ddd === null || ddd == undefined || numero != null || numero != undefined) {
        if (numero != null || numero != undefined) {
            numero = numero.replace("(", "").replace(")", "").replace(" ", "").replace("-", "").trim()
            if (numero.substring(0, 1) == 0) {
                return adicionarNove(numero.substring(1, 12))
            } else {
                return adicionarNove(numero)
            }
        }
    } else {
        numero = numero.replace("(", "").replace(")", "").replace(" ", "").replace("-", "").trim()
        if (ddd.substring(0, 1) == 0) {
            ddd = ddd.substring(1, 3)
            return adicionarNove(ddd + '' + numero)
        } else {
            return adicionarNove(ddd + '' + numero)
        }
    }
    return numero
}

function adicionarNove(numero) {
    if (numero.length == 10) {
        ddd = numero.substring(0, 2)
        numero = numero.substring(2, 10)
        return ddd + '9' + numero
    } else {
        return numero
    }
}

exports.converterDataInteiroParaStringMes = (mes) => {
    switch (mes) {
        case 1:
            return 'Janeiro'
        case 2:
            return 'Fevereiro'
        case 3:
            return 'Março'
        case 4:
            return 'Abril'
        case 5:
            return 'Maio'
        case 6:
            return 'Junho'
        case 7:
            return 'Julho'
        case 8:
            return 'Agosto'
        case 9:
            return 'Setembro'
        case 10:
            return 'Outubro'
        case 11:
            return 'Novembro'
        case 12:
            return 'Dezembro'
    }
}