const constants = require('../constants/constants');

module.exports = {
    mercadolivre: {
        CLIENT_ID: 8828109757058917,
        CLIENT_SECRET: 'CzJ8bUeMslAaNQ1BrBvTxozJ5OyHKK2G',
        CALLBACK_URL: `${constants.localhost.LOCALHOST_5000}/auth/mercadolibre/callback`
    }
}