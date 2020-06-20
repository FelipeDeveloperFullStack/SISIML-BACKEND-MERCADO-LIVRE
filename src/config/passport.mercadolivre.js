//const MercadoLibreStrategy = require('passport-mercadolibre').Strategy;
const MercadoLibreStrategy = require('./mercado-livre').Strategy
const keys = require('./keys');
const usuarioService = require("../services/usuario-service");


module.exports = (passport) => {

  passport.use(new MercadoLibreStrategy({

    clientID: keys.mercadolivre.CLIENT_ID,
    clientSecret: keys.mercadolivre.CLIENT_SECRET,
    callbackURL: keys.mercadolivre.CALLBACK_URL,

  }, (accessToken, refreshToken, user, done) => {

    usuarioService.buscarUsuarioPorNumberDocumento(user, accessToken, refreshToken)


    usuarioService.salvarUsuario(setUsuario(user, accessToken, refreshToken)) //SALVANDO NO FIREBASE

    return done(null, user);

    }
  ));

  const setUsuario = (user, accessToken, refreshToken) => {
    return usuario = {
      id: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      nickname: user.nickname,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    }
  }

  passport.serializeUser(function (user, done) {
    console.log("serializeUser")
    console.log(user)
    done(null, user);
  });
  
  passport.deserializeUser(function (user, done) {
    console.log("deserializeUser")
    console.log(user)
    done(null, user);
  });

}
