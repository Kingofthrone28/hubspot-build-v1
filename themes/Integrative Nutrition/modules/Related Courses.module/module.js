(function () {
  const scriptURL =
    'https://sdks.shopifycdn.com/js-buy-sdk/v2/latest/index.umd.min.js';
  if (window.ShopifyBuy) {
    ShopifyBuyInit();
  } else {
    loadScript();
  }

  function loadScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;

    (
      document.getElementsByTagName('head')[0] ||
      document.getElementsByTagName('body')[0]
    ).appendChild(script);

    script.onload = ShopifyBuyInit;
  }

  function ShopifyBuyInit() {
    const client = ShopifyBuy.buildClient({
      domain: 'the-institute-for-integrative-nutrition.myshopify.com',
      storefrontAccessToken: '52d11f680720b243f88329952fbe0e55',
    });

    document.querySelectorAll('.cc-price').forEach((item) => {
      const productID = item.dataset?.product_id;

      if (productID) {
        client.product
          .fetch(`gid://shopify/Product/${productID}`)
          .then((product) => {
            item.innerText = `$${parseInt(product.variants[0].price.amount).toLocaleString()}`;
          })
          .catch((e) => {
            console.log(e);
          });
      }
    });
  }
})();
