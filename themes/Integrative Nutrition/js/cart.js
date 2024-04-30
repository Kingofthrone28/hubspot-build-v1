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
  let total = 0;

  const lineItems = cart?.lineItems || [];

  if (Array.isArray(lineItems)) {
    lineItems.forEach((lineItem) => {
      total += lineItem.quantity;
    });
  }

  $('.jd-cart-item-count').text(total);
  $('.jd-view-cart-link').text(`View Cart${total ? `(${total})` : ''}`);

  if (total > 0) {
    $('.jd-cart-item-count').show();
  }
};

const setShopifyCartCookie = async (checkout, skipHubSpotEmail) => {
  const clientDomain = IINShopifyClient.config.domain;
  const storeDomain = 'store.integrativenutrition.com';
  const cookieDomain = '.integrativenutrition.com';
  const cookieName = 'shopifyCart';
  const future = new Date();

  future.setYear(future.getFullYear() + 1);

  document.cookie = `${cookieName}=${
    checkout.id
  }; domain=${cookieDomain}; expires=${future.toUTCString()};`;

  const email = '{{ contact.email }}'?.toLowerCase().trim();
  const currentEmail = `${checkout?.email}`?.toLowerCase().trim();
  const checkoutURL = checkout.webUrl.replace(clientDomain, storeDomain);

  $('.jd-checkout-link').attr('href', checkoutURL);

  if (skipHubSpotEmail || !email || email === currentEmail) {
    updateCartTotal(checkout);
    return;
  }

  try {
    const cartCookie = getCookie(cookieName);

    const newCheckout = await IINShopifyClient.checkout.updateEmail(
      cartCookie,
      email
    );

    document.cookie = `${cookieName}=${
      newCheckout.id
    }; domain=${cookieDomain}; expires=${future.toUTCString()};`;

    const newCheckoutURL = newCheckout.webUrl.replace(
      clientDomain,
      storeDomain
    );

    $('.jd-checkout-link').attr('href', newCheckoutURL);
    updateCartTotal(newCheckout);
  } catch (e) {
    console.error(e);
  }
};

const initializeCheckout = async () => {
  const cookie = getCookie('shopifyCart');

  let currentCheckout;

  if (cookie) {
    try {
      const existingCheckout = await IINShopifyClient.checkout.fetch(cookie);

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
  if (!currentCheckout || currentCheckout.completedAt) {
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

  return currentCheckout;
};

$(() => {
  initializeCheckout();
});
