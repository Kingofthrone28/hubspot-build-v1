const IINShopifyClient = ShopifyBuy.buildClient({
  domain: 'the-institute-for-integrative-nutrition.myshopify.com',
  storefrontAccessToken: '626e521d492a31fd27657fc6fa8e95b7',
});

// Get Cookie
const getCookie = (cookieName) => {
  const name = `${cookieName}=`;
  const decodedCookie = document.cookie;
  const cookieAttributes = decodedCookie.split(';');

  for (let i = 0; i < cookieAttributes.length; i++) {
    let c = cookieAttributes[i];

    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
};

// Update cart total display
const updateCartTotal = (cart) => {
  $(function () {
    let total = 0;

    for (const line of cart.lineItems) {
      total += line.quantity;
    }

    if (total > 0) {
      $('.jd-cart-item-count').text(total);
      $('.jd-cart-item-count').show();
      $('.jd-view-cart-link').text(`View Cart (${total})`);
    }
  });
};

const setShopifyCartCookie = async (checkout, skipHubSpotEmail) => {
  const future = new Date();

  future.setYear(future.getFullYear() + 1);
  document.cookie = `shopifyCart=${
    checkout.id
  }; domain=.integrativenutrition.com; expires=${future.toUTCString()};`;
  $('.jd-checkout-link').attr(
    'href',
    checkout.webUrl.replace(
      'the-institute-for-integrative-nutrition.myshopify.com',
      'store.integrativenutrition.com'
    )
  );

  const email = '{{ contact.email }}'.toLowerCase().trim();
  const currentEmail = `${checkout.email}`.toLowerCase().trim();

  if (email && !skipHubSpotEmail && email !== currentEmail) {
    try {
      const cartCookie = getCookie('shopifyCart');

      const checkoutNew = await IINShopifyClient.checkout.updateEmail(
        cartCookie,
        email
      );

      document.cookie = `shopifyCart=${
        checkoutNew.id
      }; domain=.integrativenutrition.com; expires=${future.toUTCString()};`;
      $('.jd-checkout-link').attr(
        'href',
        checkoutNew.webUrl.replace(
          'the-institute-for-integrative-nutrition.myshopify.com',
          'store.integrativenutrition.com'
        )
      );
      updateCartTotal(checkoutNew);
    } catch (e) {
      console.error(e);
    }
  } else {
    updateCartTotal(checkout);
  }
};

const initializeCheckout = async () => {
  const cartCookie = getCookie('shopifyCart');

  let currentCheckout;

  if (cartCookie) {
    try {
      const existingCheckout = await IINShopifyClient.checkout.fetch(
        cartCookie
      );

      // TODO: remove
      console.log('CART');
      console.log(existingCheckout);

      if (existingCheckout) {
        currentCheckout = existingCheckout;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Create new checkout if existing errors
  if (!currentCheckout) {
    try {
      const newCheckout = await IINShopifyClient.checkout.create();

      if (newCheckout) {
        currentCheckout = newCheckout;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (currentCheckout) {
    await setShopifyCartCookie(currentCheckout);
  } else {
    console.error('A checkout could not be created.');
  }
};

$(function () {
  initializeCheckout();
});
