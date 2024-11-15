/**
 * SM-1155: Promo Banner: (jira) aka .deal-bar (html) aka top bar (hubdb)
 * Utilities for interacting with the Shopify GraphQL admin API
 * Shopify client lib docs: https://shopify.github.io/js-buy-sdk/
 * Github source: https://github.com/Shopify/js-buy-sdk
 */

(() => {
  const addToCartKey = 'course_shopify_add_to_cart';
  const { isStringWithLength } = IIN.utilities;

  /**
   * Check a variant is available for sale
   * @param {Object} variant The shopify variant to check
   * @returns {boolean}
   */
  const isAvailable = (variant) =>
    Boolean(variant.available || variant.availableForSale);

  /**
   * Get Shopify module data from storage
   * @returns {Object|undefined}
   */
  const getAddToCartSessionData = () =>
    window.sessionStorage.getItem(addToCartKey);

  /**
   * Set Shopify add to cart session data
   * @param {Object} data
   */
  const setAddToCartSessionData = (data) => {
    window.sessionStorage.setItem(addToCartKey, data);
  };

  /** Go to the cart page on the current domain */
  const goToCart = () => {
    window.location.href = `${window.location.origin}/cart`;
  };

  /**
   * Get the Shopify cart cookie as a string
   * NB: We use || undefined to return undefined instead of an empty string
   * in order to take advantage of default parameters.
   * @returns {string|undefined}
   */
  const getCheckoutCookie = () =>
    IIN.cookies.getCookieString('shopifyCart') || undefined;

  /**
   * Get the Shopify checkout object from our cookie
   * @returns {Promise<object|undefined>} checkout object from Shopify client
   */
  const getCheckoutById = async (checkoutId = getCheckoutCookie()) => {
    if (!isStringWithLength(checkoutId)) {
      return undefined;
    }

    return IINShopifyClient.checkout.fetch(checkoutId);
  };

  /**
   * Search html document for the promo checkout button
   * @param {Document} context
   * @returns {HTMLButtonElement|null}
   */
  const getPromoCheckoutButton = (context = window.document) =>
    context.querySelector('.deal-bar .deal-bar-inner button.deal-bar-btn');

  /**
   * Examine line items in a checkout to find a product ID
   * @param {Object} checkout
   * @param {string} id
   * @returns {boolean}
   */
  const isProductInCheckout = (checkout, id) => {
    if (!checkout) {
      return false;
    }

    if (!isStringWithLength(id)) {
      throw new Error('id is a required string');
    }

    const hasProduct = checkout.lineItems?.some(
      ({ variant }) => variant?.product?.id === id,
    );

    return Boolean(hasProduct);
  };

  /**
   * Call Shopify to update the cart with a new line item
   * @param {Object[]} lineItems
   * @param {string} checkoutId cart as string
   * @returns {Promise<object|undefined>}
   */
  const addLineItemsToCheckout = async (
    lineItems,
    checkoutId = getCheckoutCookie(),
  ) => {
    if (!Array.isArray(lineItems)) {
      throw new Error(`lineItems must be an array`);
    }

    if (!lineItems.length) {
      throw new Error('No line items passed to add');
    }

    if (!isStringWithLength(checkoutId)) {
      return undefined;
    }

    return IINShopifyClient.checkout.addLineItems(checkoutId, lineItems);
  };

  /**
   * Create a variant line item for checkout
   * @param {string} id Shopify ID, e.g. gid://shopify/ProductVariant/1234
   * @returns {Object}
   */
  const createCheckoutLineItem = (id) => {
    if (!isStringWithLength(id)) {
      throw new Error('id is a required string');
    }

    return {
      variantId: id,
      quantity: 1,
    };
  };

  /**
   * Attempt to get the promo data node from the DOM
   * @param {Document} context
   * @returns {HTMLElement|null}
   */
  const getPromoElement = (context = window.document) =>
    context.getElementById('deal-bar-promo-data');

  /**
   * Attempt to read the promo code from promo data
   * @param {HTMLElement} context
   * @returns {string[]|undefined}
   */
  const getPromoCodes = (dataElement = getPromoElement()) => {
    const codeString = dataElement?.getAttribute('data-promo-code');

    if (!isStringWithLength(codeString)) {
      return undefined;
    }

    return codeString.split(',').filter(Boolean);
  };

  /**
   * Attempt to read the promo product IDs from promo data
   * @param {HTMLElement} context
   * @returns {string[]|undefined}
   */
  const getPromoProductIds = (dataElement = getPromoElement()) => {
    const idString = dataElement?.getAttribute('data-product-ids');

    if (!isStringWithLength(idString)) {
      return undefined;
    }

    return idString.split(',').filter(Boolean);
  };

  /**
   * Add a discount to a checkout
   * @param {string} checkoutId
   * @param {string} discountCode
   * @returns {Promise<object>}
   */
  const addDiscountToCheckout = async (checkoutId, discountCode) => {
    if (!isStringWithLength(discountCode)) {
      throw new Error('Discount code string is required');
    }

    if (!isStringWithLength(checkoutId)) {
      throw new Error('Checkout ID is a required string');
    }

    return IINShopifyClient.checkout.addDiscount(checkoutId, discountCode);
  };

  /**
   * Create a Shopify global product ID from a basic ID
   * @param {string} id
   * @returns {string}
   */
  const buildGlobalProductId = (id) => {
    if (!isStringWithLength(id)) {
      throw new Error('id is a required string');
    }

    return `gid://shopify/Product/${id}`;
  };

  /**
   * Create a Shopify global product variant ID from a basic ID
   * @param {string} id
   * @returns {string}
   */
  const buildGlobalProductVariantId = (id) => {
    if (!isStringWithLength(id)) {
      throw new Error('id is a required string');
    }

    return `gid://shopify/ProductVariant/${id}`;
  };

  /**
   * Get a Shopify product with a global ID
   * @param {string} globalId Shopify product ID
   * @returns {Promise<object>}
   */
  const fetchProduct = (globalId) => {
    if (!isStringWithLength(globalId)) {
      throw new Error('globalId is a required string');
    }

    return IINShopifyClient.product.fetch(globalId);
  };

  /**
   *
   * @param {Object|Object[]} productOrVariants
   * @returns {Object|undefined}
   */
  const getFirstAvailableVariant = (productOrVariants) => {
    const array = productOrVariants?.variants ?? productOrVariants;
    return array?.find?.(isAvailable);
  };

  /**
   * Check if a Shopify cart has a particular promotion applied
   * @param {Object} checkout Shopify checkout
   * @param {string} promoCode promo code
   * @returns {boolean}
   */
  const checkoutHasPromo = (checkout, promoCode) => {
    if (!isStringWithLength(promoCode)) {
      throw new Error('promoCode is a required string');
    }

    const hasPromo = checkout?.discountApplications.some(
      ({ code }) => code === promoCode,
    );

    return Boolean(hasPromo);
  };

  /**
   * Create async function to do the add to cart logic
   * @param {Object[]} lineItems
   * @param {string[]} promoCodes
   */
  const updateAndGoToCart = async (promoProducts, promoCodes) => {
    try {
      // Fetch the current checkout
      const cartId = getCheckoutCookie();
      const checkout = await getCheckoutById(cartId);
      const checkoutId = checkout.id;
      const codesToAdd = promoCodes.reduce((codes, code) => {
        if (!checkoutHasPromo(checkout, code)) {
          codes.push(code);
        }

        return codes;
      }, []);

      const lineItemsToAdd = promoProducts.reduce((products, product) => {
        if (!isProductInCheckout(checkout, product.id)) {
          const variant = getFirstAvailableVariant(product);

          if (variant) {
            const lineItem = createCheckoutLineItem(variant.id);
            products.push(lineItem);
          }
        }

        return products;
      }, []);

      if (lineItemsToAdd.length) {
        await addLineItemsToCheckout(lineItemsToAdd, checkoutId);
      }

      if (codesToAdd.length) {
        await addDiscountToCheckout(checkoutId, promoCodes[0]);
      }

      goToCart();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *
   * @param {HTMLButtonElement} button the promo banner checkout button
   */
  const updatePromoCheckoutButton = async () => {
    const button = getPromoCheckoutButton();

    if (!button) {
      return;
    }

    try {
      // Grab promo data from the DOM
      const promoElement = getPromoElement();
      const promoCodes = getPromoCodes(promoElement);
      const productIds = getPromoProductIds(promoElement);

      // If we have the deal bar button, we expect product IDs
      if (!productIds.length) {
        throw new Error('Failed to find product IDs');
      }

      const globalIds = productIds.map(buildGlobalProductId);

      // Fetch product data
      const productPromises = globalIds.reduce((array, globalId) => {
        array.push(fetchProduct(globalId));
        return array;
      }, []);

      const promoProducts = await Promise.all(productPromises);

      // Add click listener
      button.addEventListener('click', () => {
        updateAndGoToCart(promoProducts, promoCodes);
      });
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Get all available variants of a product
   * @param {Object|Object[]} productOrVariants
   * @returns {Object[]}
   */
  const getAvailableVariants = (productOrVariants) => {
    const array = productOrVariants?.variants ?? productOrVariants;
    return array?.filter?.(isAvailable);
  };

  /**
   * Check if a given product or it's variants have multiple cohorts
   * @param {Object|Object[]} productOrVariants
   * @returns {boolean}
   */
  const getHasCohorts = (productOrVariants) =>
    IIN.shopify.getAvailableVariants(productOrVariants).length > 1;

  /**
   * Get the number of product options
   */
  const getOptionsCount = (product) => product.options?.length ?? 0;

  /**
   * Call Shopify GraphQL for product information
   * @param {string} id Shopify (non-global) ID
   * @returns {Promise<Object>}
   */
  const sendProductQuery = async (id) => {
    const metaFieldConfig = [
      'metafields',
      {
        args: {
          identifiers: [
            {
              key: 'options_info_list',
              namespace: 'custom',
            },
          ],
        },
      },
      (metafield) => {
        metafield.add('key');
        metafield.add('value');
      },
    ];

    const variantConfig = [
      'variants',
      {
        args: {
          first: 10,
        },
      },
      (variant) => {
        variant.add('availableForSale');
        variant.add('title');
        variant.add('selectedOptions', (option) => {
          option.add('name');
          option.add('value');
        });
        variant.add('price', (price) => {
          price.add('amount');
          price.add('currencyCode');
        });
        variant.add('image', (image) => {
          image.add('src');
          image.add('altText');
        });
      },
    ];

    const optionsConfig = [
      'options',
      { args: { first: 10 } },
      (option) => {
        option.add('name');
        option.add('values');
      },
    ];

    const query = IINShopifyClient.graphQLClient.query((root) =>
      root.addConnection(
        'products',
        {
          args: {
            first: 1,
            query: `id:${id}`,
          },
        },
        (products) => {
          products.add('title');
          products.add('handle');
          products.add('availableForSale');
          products.add(...metaFieldConfig);
          products.add(...optionsConfig);
          products.addConnection(...variantConfig);
        },
      ),
    );
    const response = await IINShopifyClient.graphQLClient.send(query);
    return response.model?.products?.[0];
  };

  /**
   * Get Options Information List
   * This must match the index of the sendProductQuery metafields identifier list
   * @param {Object[]} metafields All product metafields
   * @returns {Object} The Options Information List metaobject
   */
  const getOptionsInfo = (metafields) => metafields?.[0];

  /**
   * Get a Shopify meta-object by id
   * https://shopify.dev/docs/api/storefront/2024-10/queries/metaobject
   * https://github.com/Shopify/storefront-api-learning-kit?tab=readme-ov-file#metafields-metaobjects
   * @returns
   */
  const getMetaObject = async (id) => {
    const metaQ = IINShopifyClient.graphQLClient.query((root) =>
      root.add(
        'metaobject',
        {
          args: {
            id,
          },
        },
        (object) => {
          object.add('fields', (fields) => {
            fields.add('key');
            fields.add('value');
          });
        },
      ),
    );

    return IINShopifyClient.graphQLClient.send(metaQ);
  };

  /**
   *
   * @param {Object[]} options Array of product options
   * @param {Object[]} valueData Array of metaobject models
   * @returns {Map<string, Map<string, Object>>|undefined}
   */
  const getValueDataByOptionName = (options, valueData) => {
    const optionTuples = options.map(({ id, name, values }) => [
      id,
      { name, values },
    ]);

    const optionInfoByID = new Map(optionTuples);
    return valueData?.reduce((map, { fields }, index) => {
      if (!fields) {
        return map;
      }

      const metaData = {};
      fields.forEach(({ key, value }) => {
        metaData[key] = value;
      });

      // `option_id` must match the Shopify metaobject field name
      /* eslint-disable-next-line camelcase --  cannot set camel case in shopify */
      const { option_id } = metaData;
      const { name, values } = optionInfoByID.get(option_id);

      // Match metadata to option value by index
      const { value } = values[index];

      if (!map.has(name)) {
        map.set(name, new Map());
      }

      map.get(name).set(value, metaData);
      return map;
    }, new Map());
  };

  IIN.shopify = {
    addDiscountToCheckout,
    addLineItemsToCheckout,
    buildGlobalProductId,
    buildGlobalProductVariantId,
    createCheckoutLineItem,
    fetchProduct,
    getAddToCartSessionData,
    getAvailableVariants,
    getCheckoutById,
    getCheckoutCookie,
    getFirstAvailableVariant,
    getHasCohorts,
    getMetaObject,
    getOptionsCount,
    getOptionsInfo,
    getPromoCheckoutButton,
    getValueDataByOptionName,
    goToCart,
    isAvailable,
    isProductInCheckout,
    sendProductQuery,
    setAddToCartSessionData,
    updatePromoCheckoutButton,
  };
})();
