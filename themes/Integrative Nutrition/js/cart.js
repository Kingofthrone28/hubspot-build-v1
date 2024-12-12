/**
 * This Shopify client is used site-wide for cart interactions.
 * @see {@link https://shopify.github.io/js-buy-sdk/ Shopify JavaScript Buy SDK}
 */
const IINShopifyClient = ShopifyBuy.buildClient({
  domain: 'the-institute-for-integrative-nutrition.myshopify.com',
  storefrontAccessToken: '626e521d492a31fd27657fc6fa8e95b7',
});

/**
 * Updates the item total that displays over the cart icon and inside the
 * modal in the header.
 * @param {Object} cart
 * @returns {number} Total items in the cart.
 */
const updateCartTotal = (cart) => {
  let total = 0;

  const lineItems = cart?.lineItems || [];

  if (Array.isArray(lineItems)) {
    lineItems.forEach((lineItem) => {
      total += lineItem.quantity;
    });
  }

  const linkText = `View Cart${total ? ` (${total})` : ''}`;

  $('.jd-view-cart-link').text(linkText);
  $('.jd-cart-item-count').text(total);

  if (total > 0) {
    $('.jd-cart-item-count').show();
  } else {
    $('.jd-cart-item-count').hide();
  }

  return total;
};

/**
 * Sets the Shopify cart cookie from a checkout.
 * @param {Object} checkout
 * @param {boolean} [skipHubSpotEmail]
 * @returns {Promise<string>} The updated cart cookie.
 */
const setShopifyCartCookie = async (checkout, skipHubSpotEmail) => {
  const clientDomain = IINShopifyClient.config.domain;
  const storeDomain = 'store.integrativenutrition.com';
  const cookieName = 'shopifyCart';
  /** Uses the HubSpot contact entity via HubL syntax. */
  const email = '{{ contact.email }}'.toLowerCase().trim();
  const currentEmail = checkout?.email?.toLowerCase().trim();
  const checkoutURL = checkout.webUrl.replace(clientDomain, storeDomain);
  const dayCount = 365;
  const encodedID = encodeURIComponent(checkout?.id);

  IIN.cookies.setCookie(cookieName, encodedID, dayCount);
  $('.jd-checkout-link').attr('href', checkoutURL);

  if (skipHubSpotEmail || !email || email === currentEmail) {
    updateCartTotal(checkout);

    return IIN.cookies.getCookie(cookieName);
  }

  try {
    const cartCookie = IIN.cookies.getCookieString(cookieName);

    const updatedCheckout = await IINShopifyClient.checkout.updateEmail(
      cartCookie,
      email,
    );

    const updatedCheckoutURL = updatedCheckout.webUrl.replace(
      clientDomain,
      storeDomain,
    );

    const updatedEncodedID = encodeURIComponent(updatedCheckout.id);

    IIN.cookies.setCookie(cookieName, updatedEncodedID, dayCount);
    $('.jd-checkout-link').attr('href', updatedCheckoutURL);
    updateCartTotal(updatedCheckout);
  } catch (e) {
    console.error(e);
  }

  return IIN.cookies.getCookie(cookieName);
};

/**
 * Updates the cart attributes from params cookie.
 * @returns {Promise<Object[]>} Custom attributes.
 *
 * @todo Set "params" in a way that guarantees its existence here.
 */
const updateCartAttributes = async () => {
  const customAttributes = [];
  const cookieName = 'params';
  let paramsCookie = IIN.cookies.getCookieObject(cookieName);

  if (!paramsCookie) {
    const checkedCookie = await IIN.cookies.checkCookie({
      intervalDuration: 50,
      maxAttempts: 100,
      name: cookieName,
    });

    if (!checkedCookie) {
      return customAttributes;
    }

    try {
      const decodedCookie = decodeURIComponent(checkedCookie);

      paramsCookie = JSON.parse(decodedCookie);
    } catch (e) {
      console.error(e);

      return customAttributes;
    }
  }

  let tracking = '';

  Object.entries(paramsCookie).forEach(([key, value]) => {
    const isTrackingParam = key.startsWith('utm_');

    if (isTrackingParam && tracking) {
      tracking += '&';
    }

    if (isTrackingParam) {
      tracking += `${key}=${value}`;
    }
  });

  const { sldiscountcode, source } = paramsCookie;

  const irclickid = IIN.cookies.getCookieString('_irclickid');

  if (!sldiscountcode && !source && !tracking && !irclickid) {
    return customAttributes;
  }

  if (source) {
    customAttributes.push({
      key: 'Partner Lead Source',
      value: source,
    });
  }

  if (sldiscountcode) {
    customAttributes.push({
      key: 'Promo Code',
      value: sldiscountcode,
    });
  }

  if (tracking) {
    customAttributes.push({
      key: 'Tracking',
      value: tracking,
    });
  }

  if (irclickid) {
    customAttributes.push({
      key: 'irclickid',
      value: irclickid,
    });
  }

  const cartAttributes = { customAttributes };
  const cartCookie = IIN.cookies.getCookieString('shopifyCart');

  try {
    await IINShopifyClient.checkout.updateAttributes(
      cartCookie,
      cartAttributes,
    );
  } catch (e) {
    console.error(e);
  }

  return customAttributes;
};

/**
 * Initializes a checkout.
 * @returns {Promise<Object>} An existing or new checkout.
 */
const initializeCheckout = async () => {
  const cookie = IIN.cookies.getCookieString('shopifyCart');
  let currentCheckout;

  if (cookie) {
    try {
      const existingCheckout = await IINShopifyClient.checkout.fetch(cookie);

      if (existingCheckout) {
        currentCheckout = existingCheckout;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /** Create a new checkout if attempt to find an existing one fails. */
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

  await updateCartAttributes();

  return currentCheckout;
};

/**
 * Refreshes a checkout.
 * @param {String} cookie optional cookie key for cart
 * @returns {Promise<Object>} An existing or new checkout.
 */
const refreshCheckout = async (cookie) => {
  const cookieString = cookie ?? IIN.cookies.getCookieString('shopifyCart');
  const currentCheckout = await IINShopifyClient.checkout.fetch(cookieString);
  let refreshedCheckout = currentCheckout;

  if (!currentCheckout || currentCheckout.completedAt) {
    refreshedCheckout = await initializeCheckout();
  }

  return refreshedCheckout;
};

$(() => {
  initializeCheckout();
});

/**
 * After a checkout has been initialized, if the customer navigates away from
 * the site and returns, certain types of navigation will cause the browser to
 * use a cached version of the page without re-executing the JavaScript. When
 * these types of navigations occur, the checkout should be refreshed and the
 * DOM should be updated.
 */
window.addEventListener('pageshow', (event) => {
  const navigationType = performance.getEntriesByType('navigation')[0].type;

  if (!event.persisted && navigationType !== 'back_forward') {
    return;
  }

  $(() => {
    refreshCheckout();
  });
});
