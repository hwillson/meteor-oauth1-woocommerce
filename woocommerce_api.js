var urlModule = Npm.require('url');

WooApi = (function () {

  var config, url;

  /* Public */

  var init = function (wooConfig, wooUrl) {
    if (_.isObject(wooConfig)) {
      if (wooConfig.consumerKey && wooConfig.secret) {
        config = wooConfig;
        url = wooUrl;
      } else {
        throw new Error('Config must contain "consumerKey" and "secret".');
      }
    } else {
      throw new Error('Missing config object.');
    }
  };

  var get = function (url, params, callback) {
    return sendRequest('GET', url, params, callback);
  };

  var post = function (url, params, callback) {
    return sendRequest('POST', url, params, callback);
  };

  /* Private */

  var encodeString = function (value) {
    return encodeURIComponent(value)
      .replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
  };

  var encodeParams = function (params) {
    return _.reduce(params, function (memo, val, key) {
      memo[encodeString(key)] = encodeString(val);
      return memo;
    }, {});
  };

  var getAuthParams = function () {
    return {
      oauth_consumer_key: config.consumerKey,
      oauth_nonce: Random.secret().replace(/\W/g, ''),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: (new Date().valueOf()/1000).toFixed().toString()
    };
  };

  var getSignature = function (method, url, authParams, queryParams) {

    var combinedParams, params, signatureBase, secret, signingKey;

    combinedParams = encodeParams(_.extend(authParams, queryParams));
    params = _.map(combinedParams, function (val, key) {
      return key + '=' + val;
    }).sort().join('&');

    signatureBase = [
      method,
      encodeString(url),
      encodeString(params)
    ].join('&');

    secret = OAuth.openSecret(config.secret);
    signingKey = encodeString(secret);

    return crypto.createHmac('SHA1', signingKey).update(signatureBase)
      .digest('base64');

  };

  var sendRequest = function (method, url, queryParams, callback) {

    var parsedUrl, authParams, params = {}, response;

    queryParams = queryParams || {};
    parsedUrl = urlModule.parse(url, true);
    queryParams = _.extend({}, parsedUrl.query, params);

    authParams = getAuthParams();
    authParams.oauth_signature =
      getSignature(method, url, authParams, queryParams);

    params = _.extend(authParams, queryParams);

    parsedUrl.query = {};
    parsedUrl.search = '';
    url = urlModule.format(parsedUrl);

    try {
      response = HTTP.call(method, url, {
        params: params
      }, callback && function (error, response) {
        if (! error) {
          response.nonce = params.oauth_nonce;
        }
        callback(error, response);
      });
      if (response)
        response.nonce = params.oauth_nonce;
      return response;
    } catch (err) {
      throw _.extend(
        new Error('Failed to send OAuth1 request to ' + url + '. ' + err.message),
        { response: err.response }
      );
    }

  };

  return {
    init: init,
    get: get
  };

}());
