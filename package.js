Package.describe({
  name: 'hwillson:woocommerce-api',
  version: '0.0.1',
  summary: "Library used to communicate with WooCommerce's REST API.",
  git: 'https://github.com/hwillson/meteor-woocommerce-api',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');
  api.use('oauth', ['client', 'server']);
  //api.use('oauth1', ['client', 'server']);
  //api.export('OAuth1WooBinding', 'server');
  api.export('WooApi', 'server');
  api.addFiles('woocommerce_api.js');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.addFiles('woocommerce_api.js');
  api.addFiles('woocommerce_api_tests.js', 'server');
});
