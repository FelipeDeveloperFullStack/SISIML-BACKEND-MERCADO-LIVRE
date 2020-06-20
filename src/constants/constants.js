const PORT_3000 = process.env.PORT || 3000;
const PORT_5000 = process.env.PORT || 5000;
const PRODUCAO = ''

const localhost = {
    LOCALHOST_3000: `http://localhost:${PORT_3000}`,
    LOCALHOST_5000: `http://localhost:${PORT_5000}`
}

const producao = {
    PRODUCAO: `http://localhost:${PORT_5000}`
}

const urlbase = {
    COLLECTION_USUARIOS: "https://sisiml.firebaseio.com/usuarios/usuario.json"
}

const API_MERCADO_LIVRE = "https://api.mercadolibre.com"

module.exports = {
    localhost,
    urlbase,
    API_MERCADO_LIVRE,
    producao
}