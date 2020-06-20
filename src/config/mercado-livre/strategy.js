var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , https = require('https');


/**
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  //options = options || {}; 
  options.authorizationURL = 'https://auth.mercadolivre.com.br/authorization';
  options.tokenURL = 'https://api.mercadolibre.com/oauth/token';
  this.profileUrl = "https://api.mercadolibre.com/users/me";
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'mercadolibre';

}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.get(this.profileUrl, accessToken, function (err, body, res) {

    if (err) { return done(err); };
    
    try {
      var json = JSON.parse(body);

      // console.log('\n');
      // console.log('ID: '+json.id);
      // console.log('Nickname: '+json.nickname);
      // console.log('Name: '+json.first_name);
      // console.log('CPF/CNPJ: '+json.identification.type);
      // console.log('Number: '+json.identification.number);
      // console.log('AccessToken: '+accessToken)
      // console.log('\n');

      var profile = { provider: 'MercadoLibre' };
      profile.id = json.id;
      profile.nickname = json.nickname; 
      profile.first_name = json.first_name;
      profile.last_name = json.last_name;
      profile.email = json.email;
      profile.accessToken = accessToken;     
      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    };
  });
}

/**
 * Setup SSLv3 because of MercadoLibre API requirement
 */
//https.globalAgent.options.secureProtocol = 'SSLv3_method';

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;