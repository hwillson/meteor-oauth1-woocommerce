Tinytest.add(
  '#init - Should throw an exception if the config is missing',
  function (test) {
    var wooApi = Object.create(WooApi);
    test.throws(wooApi.init);
  }
);
