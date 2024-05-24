/**
 * @see {@link https://shopify.github.io/js-buy-sdk/ Shopify JavaScript Buy SDK}
 * @see {@link https://kenwheeler.github.io/slick/ Slick Carousel}
 */

(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('cart');

    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.error(e);
    return;
  }

  const rootDomain = 'integrativenutrition.com';
  const cookieDomain = `.${rootDomain}`;
  const externalDomain = `store.${rootDomain}`;
  const internalDomain =
    'the-institute-for-integrative-nutrition.myshopify.com';
  const imagePath = `https://course.${rootDomain}/hubfs/Course%20Page%20Images`;
  const gidPath = 'gid://shopify/Product/';
  const sliderBreakMobile = 850;
  const sliderBreakSmDesk = 1240;

  const agreementTags = [
    {
      name: 'admin-CertificationAgreement',
      pathSuffix: 'certification',
    },
    {
      name: 'admin-FoundationsAgreement',
      pathSuffix: 'foundations',
    },
  ];

  let agreementProducts = [];
  let checkoutURL = '';
  let currentWidth = window.innerWidth;

  /**
   * Gets the value of a metafield.
   * @param {Object} data
   * @param {string} fieldName
   * @returns {*} Metafield value
   */
  const getMetafield = (data, fieldName) => {
    const matchedField = data?.metafields.find(
      (metafield) => metafield?.key && metafield.key === fieldName
    );

    const matchedValue = matchedField?.value;
    let value = null;

    if (typeof matchedValue !== 'undefined') {
      value = matchedValue;
    }

    return value;
  };

  /**
   * Gets the URL to the Shopify store, potentially with a redirect.
   * @returns {string} A URL.
   */
  const getStoreURL = () => {
    const targetURL = new URL(checkoutURL);
    const { search } = targetURL;
    const searchData = search.startsWith('?') ? search.slice(1) : search;
    const searchParams = IIN.utilities.makeObjectFromKeyValueString(searchData);
    const checkoutParams = IIN.cookies.getCookieObject('checkoutQuery');
    const trackingParams = IIN.cookies.getCookieObject('params');
    const allParams = { ...searchParams, ...checkoutParams, ...trackingParams };
    const targetParams = {};

    Object.entries(allParams).forEach(([key, value]) => {
      if (key === 'sldiscountcode') {
        targetParams.discount = value;
      } else if (key === 'url') {
        targetParams[key] = encodeURIComponent(value);
      } else {
        targetParams[key] = value;
      }
    });

    /**
     * SocialLadder tracking cookies currently must be set by visiting a Shopify
     * page where their JS is called. Simply adding a "redirect" param with the
     * encoded checkout URL causes the checkout page to 404. The URL becomes
     * malformed after the redirect because Shopify is unhappy about processing
     * URL params that have brackets in their keys. The brackets are required
     * for the billing address fields to be set automatically.
     *
     * @todo Remove after another approach is found.
     *
     * const ambassadorID = trackingParams?.ambassadorID;
     * const sldiscountcode = trackingParams?.sldiscountcode;
     * const shouldRedirect = Boolean(ambassadorID && sldiscountcode);
     *
     * if (shouldRedirect) {
     *   targetParams.redirect = encodeURIComponent(targetURL.pathname);
     *   targetURL.pathname = `/discount/${sldiscountcode}`;
     * }
     */

    targetURL.search = IIN.utilities.makeKeyValueStringFromObject(targetParams);

    return targetURL.toString();
  };

  /**
   * Adds a bundle to the cart.
   * @param {string} bundleID
   * @returns {Promise<void>}
   */
  async function addBundleToCart(bundleID) {
    const cartItems = [];

    $(`#bundle-${bundleID} .jd-cart-rec-item-to-add`).each(function () {
      const variantID = $(this).val();

      if (variantID) {
        cartItems.push({
          variantId: variantID,
          quantity: 1,
        });
      }
    });

    const cartCookie = IIN.cookies.getCookieString('shopifyCart');

    try {
      await IINShopifyClient.checkout.addLineItems(cartCookie, cartItems);
      await loadCart();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Creates a new checkout (if one does not already exist) then loads the cart.
   * @returns {Promise<void>}
   */
  async function initializeCart() {
    const cartCookie = IIN.cookies.getCookieString('shopifyCart');

    try {
      let existingCheckout;

      if (cartCookie) {
        existingCheckout = await IINShopifyClient.checkout.fetch(cartCookie);
      }

      if (!existingCheckout) {
        const newCheckout = await IINShopifyClient.checkout.create();

        await setShopifyCartCookie(newCheckout);
      }

      await loadCart();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Determine which products require an enrollment agreement update the
   * checkout button to either go to Shopify directly or trigger the form modal.
   * @param {Object} checkout
   * @returns {Promise<void>}
   */
  async function initializeCohortProducts(checkout) {
    agreementProducts = [];
    $('.jd-checkout-btn-wrap').hide();

    if (!checkout?.lineItems.length) {
      return;
    }

    let productQuery = '';

    checkout.lineItems.forEach((lineItem, index) => {
      const { id } = lineItem.variant.product;

      productQuery += `id:${id.replace(gidPath, '')}`;

      if (index < checkout.lineItems.length - 1) {
        productQuery += ' OR ';
      }
    });

    const namespace = 'custom';

    const productsQuery = IINShopifyClient.graphQLClient.query((root) => {
      root.addConnection(
        'products',
        {
          args: {
            first: 100,
            query: productQuery,
          },
        },
        (product) => {
          product.add('handle');
          product.add('tags');
          product.add('title');
          product.add(
            'metafields',
            {
              args: {
                identifiers: [
                  { key: 'agreement_publication_date', namespace },
                  { key: 'agreement_revision_date', namespace },
                  { key: 'books_and_materials', namespace },
                  { key: 'number_of_clock_hours', namespace },
                  { key: 'number_of_weeks', namespace },
                  { key: 'registration_cost', namespace },
                ],
              },
            },
            (metafield) => {
              metafield.add('key');
              metafield.add('value');
            }
          );
          product.addConnection(
            'variants',
            {
              args: {
                first: 100,
              },
            },
            (variant) => {
              variant.add('availableForSale');
              variant.add('title');
              variant.add(
                'metafields',
                {
                  args: {
                    identifiers: [{ key: 'start_date', namespace }],
                  },
                },
                (metafield) => {
                  metafield.add('key');
                  metafield.add('value');
                }
              );
            }
          );
        }
      );
    });

    try {
      const { model } = await IINShopifyClient.graphQLClient.send(
        productsQuery
      );

      model.products.forEach((product) => {
        for (const tag of product.tags) {
          if (
            agreementTags.some(
              (agreementTag) => tag.value === agreementTag.name
            )
          ) {
            const adjustedProduct = { ...product };

            checkout.lineItems.forEach((lineItem) => {
              if (lineItem.variant.product.id !== product.id) {
                return;
              }

              let totalDiscount = 0;

              if (lineItem.discountAllocations.length) {
                lineItem.discountAllocations.forEach((allocation) => {
                  const discountAmount = parseFloat(
                    allocation?.allocatedAmount?.amount || 0
                  );

                  totalDiscount -= discountAmount * lineItem.quantity;
                });
              }

              adjustedProduct.price = parseFloat(
                lineItem.variant?.price?.amount || 0
              );

              adjustedProduct.totalDiscount = totalDiscount;

              const selectedVariant = product.variants.find(
                (productVariant) => productVariant.id === lineItem.variant.id
              );

              if (selectedVariant) {
                adjustedProduct.variant = selectedVariant;
              }
            });

            agreementProducts.push(adjustedProduct);
            break;
          }
        }
      });

      const agreementCookie = IIN.cookies.getCookieString(
        'enrollmentAgreementQuery'
      );

      if (agreementProducts.length && !agreementCookie) {
        $('#jd-checkout-btn').text('Proceed to Enrollment');
      } else {
        $('#jd-checkout-btn').text('Proceed to Checkout');
        await setEnrollmentLinks();
      }

      $('.jd-checkout-btn-wrap').show();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Inserts the dynamic markup for the cart.
   * @param {boolean} noProductChange
   * @returns {Promise<void>}
   *
   * @todo On navigation event.persisted and type "back_forward" this needs to
   *   be re-executed.
   */
  async function loadCart(noProductChange) {
    const cartCookie = IIN.cookies.getCookieString('shopifyCart');
    let checkout;

    if (cartCookie) {
      try {
        checkout = await IINShopifyClient.checkout.fetch(cartCookie);
      } catch (e) {
        console.error(e);
      }
    }

    if (!checkout) {
      $('.jd-cart-outer').addClass('jd-cart-empty');
      $('.jd-cart-items').html('');
      await loadProductRecommendations();
      return;
    }

    if (!noProductChange) {
      await initializeCohortProducts(checkout);
      checkoutURL = checkout.webUrl.replace(internalDomain, externalDomain);

      let parsedItems;

      try {
        parsedItems = JSON.parse(JSON.stringify(checkout.lineItems));
      } catch (e) {
        console.error(e);
      }

      if (parsedItems) {
        await loadProductRecommendations(parsedItems);
      }
    }

    const itemCount = checkout.lineItems.length;

    if (!itemCount) {
      $('.jd-cart-outer').addClass('jd-cart-empty');
      $('.jd-cart-items').html('');
      return;
    }

    $('.jd-cart-outer').removeClass('jd-cart-empty');

    let productQuery = '';

    checkout.lineItems.forEach((lineItem, index) => {
      const { id } = lineItem.variant.product;

      productQuery += `id:${id.replace(gidPath, '')}`;

      if (index < itemCount - 1) {
        productQuery += ' OR ';
      }
    });

    const productsQuery = IINShopifyClient.graphQLClient.query((root) => {
      root.addConnection(
        'products',
        {
          args: {
            first: 100,
            query: productQuery,
          },
        },
        (product) => {
          product.add('title');
          product.add(
            'metafields',
            {
              args: {
                identifiers: [
                  {
                    key: 'program_label',
                    namespace: 'custom',
                  },
                ],
              },
            },
            (metafield) => {
              metafield.add('key');
              metafield.add('value');
            }
          );
        }
      );
    });

    try {
      const { model } = await IINShopifyClient.graphQLClient.send(
        productsQuery
      );

      model.products.forEach((product) => {
        const matchedItem = checkout.lineItems.find(
          (lineItem) => lineItem.variant.product.id === product.id
        );

        if (!matchedItem) {
          return;
        }

        for (const metafield of product.metafields) {
          if (metafield?.key === 'program_label') {
            if (metafield.value) {
              matchedItem.programLabel = metafield.value;
            }

            break;
          }
        }
      });
    } catch (e) {
      console.error(e);
    }

    let itemsHTML = '';
    let itemSummaryHTML = '';

    for (const lineItem of checkout.lineItems) {
      const options = [];

      lineItem.variant.selectedOptions.forEach((option) => {
        if (option.value !== 'Default Title') {
          options.push({ name: option.name, value: option.value });
        }
      });

      if (lineItem.quantity > 1) {
        options.push({ name: 'Quantity', value: lineItem.quantity });
      }

      let optionsHTML = '';

      options.forEach((option) => {
        optionsHTML += `
          <div>
            <strong>${option.name}:</strong> ${option.value}
          </div>
        `;
      });

      const priceAmount = parseFloat(lineItem.variant?.price?.amount || 0);
      const totalPreDiscount = priceAmount * lineItem.quantity;
      let total = totalPreDiscount;

      if (lineItem.discountAllocations.length) {
        lineItem.discountAllocations.forEach((discount) => {
          const discountAmount = parseFloat(
            discount.allocatedAmount?.amount || 0
          );

          if (total > 0) {
            total -= discountAmount * lineItem.quantity;
          }
        });
      }

      let itemAmountHTML = '';

      if (total === totalPreDiscount) {
        itemAmountHTML = `
          <div style="margin-top: 15px" class="jd-cart-item-price">
            $${total.toLocaleString()}
          </div>
        `;
      } else {
        itemAmountHTML = `
          <div class="jd-cart-item-price-dis">
            $${totalPreDiscount.toLocaleString()}
          </div>
          <div class="jd-cart-item-price">
            $${total.toLocaleString()}
          </div>
        `;
      }

      let programLabel = '';

      if (lineItem.programLabel) {
        programLabel = `
          <div class="jd-cart-rec-item-program">
            ${lineItem.programLabel.toUpperCase()}
          </div>
        `;
      }

      itemsHTML += `
        <div class="jd-cart-item">
          <div class="jd-add-pop-content">
            <div class="jd-add-pop-img">
              <div style="background: url(${lineItem.variant.image.src})"></div>
            </div>
            <div class="jd-add-pop-content-main">
              ${programLabel}
              <div class="jd-add-pop-name">${lineItem.title}</div>
              <div class="jd-add-pop-options">${optionsHTML}</div>
              <div class="jd-cart-item-btns">
                ${
                  optionsHTML
                    ? `
                    <button
                      data-line="${lineItem.id}"
                      class="jd-cart-item-btn jd-cart-item-edit"
                      type="button"
                    >
                      <svg
                        clip-rule="evenodd"
                        fill-rule="evenodd"
                        stroke-linejoin="round"
                        stroke-miterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.749c0-.414.336-.75.75-.75s.75.336.75.75v9.249c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm1.521 9.689 9.012-9.012c.133-.133.217-.329.217-.532 0-.179-.065-.363-.218-.515l-2.423-2.415c-.143-.143-.333-.215-.522-.215s-.378.072-.523.215l-9.027 8.996c-.442 1.371-1.158 3.586-1.264 3.952-.126.433.198.834.572.834.41 0 .696-.099 4.176-1.308zm-2.258-2.392 1.17 1.171c-.704.232-1.274.418-1.729.566zm.968-1.154 7.356-7.331 1.347 1.342-7.346 7.347z" fill-rule="nonzero"/>
                      </svg>
                      Edit
                    </button>
                    <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
                    `
                    : ''
                }
                <button
                  data-line="${lineItem.id}"
                  class="jd-cart-item-btn jd-cart-item-delete"
                  type="button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  >
                    <path d="M19 24h-14c-1.104 0-2-.896-2-2v-17h-1v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2h-1v17c0 1.104-.896 2-2 2zm0-19h-14v16.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-16.5zm-9 4c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm-2-7h-4v1h4v-1z"/>
                  </svg>
                  Delete
                </button>
              </div>
              <div></div>
            </div>
          </div>
          <div>
            ${itemAmountHTML}
          </div>
        </div>
      `;

      itemSummaryHTML += `
        <div style="font-size: 20px;">
          $${total.toLocaleString()}
        </div>
      `;
    }

    if (itemCount > 1) {
      itemSummaryHTML += `
        <div style="font-size: 20px; border-top: 1px solid #ccc; padding-top: 5px">
          $${parseFloat(checkout.totalPrice.amount).toLocaleString()}
        </div>
      `;
    }

    $('.jd-cart-items').html(itemsHTML);

    const summaryHeading = `Order Summary <em>(${itemCount} item${
      itemCount === 1 ? '' : 's'
    })</em>`;

    $('.jd-cart-summary > div:first-child').html(summaryHeading);

    if (itemCount) {
      $('.jd-cart-summary-items').html(itemSummaryHTML);
      $('.jd-checkout-btn-wrap').show();
    } else {
      $('.jd-cart-summary-items').html('');
      $('.jd-checkout-btn-wrap').hide();
    }

    /**
     * Refreshes the cart if a checkout is no longer valid.
     * @returns {Promise<Object>}
     */
    const refreshCheckout = async () => {
      const currentCheckout = await IINShopifyClient.checkout.fetch(cartCookie);
      let refreshedCheckout = currentCheckout;

      if (!currentCheckout || currentCheckout.completedAt) {
        refreshedCheckout = await initializeCheckout();
        await loadCart();
      }

      return refreshedCheckout;
    };

    /**
     * Deletes an item from the cart and updates the total.
     * @param {string} lineID
     * @returns {Promise<void>}
     */
    const deleteFromCart = async (lineID) => {
      const refreshedCheckout = await refreshCheckout();

      if (!refreshedCheckout || !refreshedCheckout.lineItems?.length) {
        return;
      }

      const updatedCheckout = await IINShopifyClient.checkout.removeLineItems(
        cartCookie,
        [lineID]
      );

      await loadCart();
      updateCartTotal(updatedCheckout);
    };

    $('.jd-cart-item-delete').click(function (e) {
      e.preventDefault();

      const lineID = $(this).data('line');

      deleteFromCart(lineID);
    });

    /**
     * Edits a line item in the cart by displaying a variant select dropdown.
     * @param {string} lineID
     * @param {string} target
     * @returns {Promise<void>}
     */
    const editCart = async (lineID, target) => {
      const refreshedCheckout = await refreshCheckout();
      const lineItems = refreshedCheckout?.lineItems || [];

      if (!Array.isArray(lineItems) || !lineItems.length) {
        return;
      }

      const line = lineItems.find((lineItem) => lineItem.id === lineID);

      if (!line) {
        return;
      }

      const uniqueID = new Date().getTime();

      let selectHTML = `<select id="${uniqueID}" class="jd-cart-rec-select">`;

      selectHTML += '<option disabled>Cohorts</option>';

      const { selectedOptions } = line.variant;
      const selectedValues = selectedOptions.map((option) => option.value);
      const selectedTitle = selectedValues.join(' / ');
      const productID = line.variant.product.id;
      const lineProduct = await IINShopifyClient.product.fetch(productID);

      lineProduct.variants.forEach((variant) => {
        if (!variant.available) {
          return;
        }

        selectHTML += `
          <option
            value="${variant.id}"
            ${variant.title === selectedTitle ? 'selected' : ''}
          >
            ${variant.title}
          </option>
        `;
      });

      selectHTML += `</select>`;

      $(target).parent().next().html(selectHTML);

      /**
       * Refreshes the checkout, updates line items, and reloads the cart.
       * @param {string} variantID
       * @returns {Promise<void>}
       */
      const changeCart = async (variantID) => {
        const lineItemUpdate = [
          {
            id: lineID,
            variantId: variantID,
          },
        ];

        const changedCheckout = await refreshCheckout();

        if (!changedCheckout || !changedCheckout.lineItems?.length) {
          return;
        }

        await IINShopifyClient.checkout.updateLineItems(
          cartCookie,
          lineItemUpdate
        );

        loadCart(true);
      };

      $(`#${uniqueID}`).change(function () {
        const variantID = $(this).val();

        changeCart(variantID);
      });
    };

    $('.jd-cart-item-edit').click(function (e) {
      e.preventDefault();

      const lineID = $(this).data('line');
      const { target } = e;

      editCart(lineID, target);
    });
  }

  /**
   * Inserts the dynamic markup for product recommendations.
   * @param {Object[]} lineItems
   * @returns {Promise<void>}
   */
  async function loadProductRecommendations(lineItems) {
    $('.jd-cart-rec-outer').hide();

    const sortedItems =
      lineItems?.sort((a, b) => {
        const aPrice = parseFloat(a.variant.price.amount);
        const bPrice = parseFloat(b.variant.price.amount);

        if (aPrice > bPrice) {
          return -1;
        }

        if (aPrice < bPrice) {
          return 1;
        }

        return 0;
      }) || [];

    const bundleData = moduleData?.bundles || [];
    const matchedBundles = [];
    const maximumCount = 3;
    let firstMatchedID = 'NO_MATCH';
    let bundlesFirstItem = 0;

    for (const lineItem of sortedItems) {
      for (const bundle of bundleData) {
        const existingBundle = matchedBundles.find(
          (matchedBundle) => matchedBundle.name === bundle.name
        );

        if (!existingBundle || bundle.shopify_product_ids) {
          const { id } = lineItem.variant.product;
          const productID = id.replace(gidPath, '');

          if (bundle.shopify_product_ids.includes(productID)) {
            let hasAllItems = true;
            const bundleIDs = bundle.shopify_product_ids.split(',');

            for (const bundleID of bundleIDs) {
              const existingLineItem = sortedItems.find(
                (li) => li.variant.product.id === `${gidPath}${bundleID}`
              );

              if (!existingLineItem) {
                hasAllItems = false;
                break;
              }
            }

            if (hasAllItems) {
              bundle.hasAllItems = true;
            } else {
              if (firstMatchedID === productID && bundlesFirstItem > 2) {
                bundlesFirstItem++;
              } else if (firstMatchedID === 'NO_MATCH') {
                firstMatchedID = productID;
                bundlesFirstItem++;
              }

              matchedBundles.push(bundle);
            }
          }

          if (matchedBundles.length === maximumCount) {
            break;
          }
        }
      }

      if (matchedBundles.length === maximumCount) {
        break;
      }
    }

    // Adds other bundles if there are less than 3 matches.
    if (matchedBundles.length < maximumCount) {
      for (const bundle of bundleData) {
        const existingBundle = matchedBundles.find(
          (matchedBundle) => matchedBundle.name === bundle.name
        );

        if (
          !existingBundle &&
          !bundle.hasAllItems &&
          !bundle.shopify_product_ids.includes(firstMatchedID)
        ) {
          matchedBundles.push(bundle);
        }

        if (matchedBundles.length === maximumCount) {
          break;
        }
      }
    }

    if (!matchedBundles.length) {
      return;
    }

    const promises = [];

    /**
     * Sets markup for the product recommendation bundles.
     * @param {Object} matchedBundle
     * @param {number} bundleIndex
     * @returns {Promise<string>} Markup for the bundles.
     */
    const setBundles = async (matchedBundle, bundleIndex) => {
      const bundleIDs = matchedBundle.shopify_product_ids.split(',');

      let bundleProducts = [];
      let productQuery = '';

      bundleIDs.forEach((bundleID, idIndex) => {
        productQuery += `id:${bundleID}`;

        if (idIndex < bundleIDs.length - 1) {
          productQuery += ' OR ';
        }
      });

      const productsQuery = IINShopifyClient.graphQLClient.query((root) => {
        root.addConnection(
          'products',
          {
            args: {
              first: 100,
              query: productQuery,
            },
          },
          (product) => {
            product.add('handle');
            product.add('tags');
            product.add('title');
            product.addConnection(
              'images',
              {
                args: {
                  first: 1,
                },
              },
              (image) => {
                image.add('src');
              }
            );
            product.addConnection(
              'variants',
              {
                args: {
                  first: 100,
                },
              },
              (variant) => {
                variant.add('priceV2', (price) => {
                  price.add('amount');
                });

                variant.add('availableForSale');
                variant.add('title');
              }
            );
            product.add(
              'metafields',
              {
                args: {
                  identifiers: [
                    {
                      key: 'program_label',
                      namespace: 'custom',
                    },
                  ],
                },
              },
              (metafield) => {
                metafield.add('key');
                metafield.add('value');
              }
            );
          }
        );
      });

      try {
        const { model } = await IINShopifyClient.graphQLClient.send(
          productsQuery
        );

        bundleProducts = model.products;
      } catch (e) {
        console.error(e);
      }

      if (!Array.isArray(bundleProducts) || !bundleProducts.length) {
        throw new Error('No bundle products were found');
      }

      const cartItems = [];
      const existingProducts = [];
      const newProducts = [];

      bundleProducts.forEach((bundleProduct) => {
        for (const variant of bundleProduct.variants) {
          if (variant.availableForSale) {
            cartItems.push({
              variantId: variant.id,
              quantity: 1,
            });

            break;
          }
        }
      });

      const bundleCart = await IINShopifyClient.checkout.create();
      const cartID = bundleCart?.id;

      await IINShopifyClient.checkout.addLineItems(cartID, cartItems);

      const bundleCheckout = await IINShopifyClient.checkout.fetch(cartID);
      const totalPrice = bundleCheckout.totalPrice?.amount || 0;
      const totalAfterDiscount = parseFloat(totalPrice);
      let total = totalAfterDiscount;

      if (bundleCheckout.discountApplications?.length) {
        bundleCheckout.discountApplications.forEach((discount) => {
          total += parseFloat(discount?.value?.amount || 0);
        });
      }

      // TODO: should the checkout be destroyed? No need to keep it around.

      let cartRecPricesHTML = '<div>Bundle Total price: </div>';

      const savings =
        total === totalAfterDiscount ? 0 : total - totalAfterDiscount;

      const localeOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      };

      if (total === totalAfterDiscount) {
        cartRecPricesHTML += `
          <div></div>
          <div>$${total.toLocaleString(undefined, localeOptions)} USD</div>
        `;
      } else {
        cartRecPricesHTML += `
          <div>$${total.toLocaleString(undefined, localeOptions)} USD</div>
          <div>$${totalAfterDiscount.toLocaleString(
            undefined,
            localeOptions
          )} USD</div>
        `;
      }

      bundleProducts.forEach((bundleProduct) => {
        const existingLineItem = sortedItems.find(
          (li) => li.variant.product.id === bundleProduct.id
        );

        if (existingLineItem) {
          existingProducts.push(bundleProduct);
        } else {
          newProducts.push(bundleProduct);
        }
      });

      let courseListHTML = '';

      existingProducts.forEach((existingProduct, productIndex) => {
        let price = '';

        for (const variant of existingProduct.variants) {
          if (variant.availableForSale) {
            price = variant.priceV2.amount;
            break;
          }
        }

        let topSavings = '';

        if (productIndex === 0 && savings) {
          topSavings = `
            <div class="jd-cart-rec-save-tag">
              Save $${savings.toLocaleString()}
            </div>
          `;
        }

        let programLabel = '';

        for (const metafield of existingProduct.metafields) {
          if (metafield?.key === 'program_label') {
            if (metafield.value) {
              let logo = 'iin_logo.png';

              if (metafield.value.toLowerCase().includes('chopra')) {
                logo = 'chopra_logo.png';
              }

              const src = `${imagePath}/${logo}`;

              programLabel = `
                <div class="jd-cart-rec-item-program">
                  <div><img src=${src}></div>
                  ${metafield.value}
                </div>
              `;
            }

            break;
          }
        }

        const imageSource = existingProduct.images[0].src;

        courseListHTML += `
          <div class="jd-cart-rec-item">
            ${topSavings}
            ${
              imageSource
                ? `<div class="jd-cart-rec-item-img" style="background: url('${imageSource}');"></div>`
                : ''
            }
            <div class="jd-cart-rec-item-inner"${
              topSavings ? 'style="padding-top: 30px"' : ''
            }>
              <div>
                ${programLabel}
                <div>${existingProduct.title}</div>
              </div>
              <div>$${parseFloat(price).toLocaleString(
                undefined,
                localeOptions
              )} USD</div>
            </div>
          </div>
        `;
      });

      if (existingProducts.length && newProducts.length) {
        courseListHTML += `
          <div class="jd-cart-rec-plus">
            <svg
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/>
            </svg>
          </div>
        `;
      }

      newProducts.forEach((product, productIndex) => {
        let price = '';

        for (const variant of product.variants) {
          if (variant.availableForSale) {
            price = variant.priceV2.amount;
            break;
          }
        }

        let topSavings = '';

        if (productIndex === 0 && !existingProducts.length) {
          topSavings = `
            <div class="jd-cart-rec-save-tag">
              Save $${savings.toLocaleString(undefined, localeOptions)}
            </div>
          `;
        }

        let programLabel = '';

        for (const metafield of product.metafields) {
          if (metafield?.key === 'program_label') {
            if (metafield.value) {
              let logo = 'iin_logo.png';

              if (metafield.value.toLowerCase().includes('chopra')) {
                logo = 'chopra_logo.png';
              }

              const src = `${imagePath}/${logo}`;

              programLabel += `
                <div class="jd-cart-rec-item-program">
                  <div><img src="${src}"></div>
                  ${metafield.value}
                </div>
              `;
            }

            break;
          }
        }

        let optionHTML = '';

        product.variants.forEach((variant, variantIndex) => {
          if (variant.availableForSale) {
            optionHTML += `
              <option value="${variant.id}"${
              variantIndex === 0 ? ' selected' : ''
            }>
                ${variant.title}
              </option>
            `;
          }
        });

        const hasSingleVariant =
          product.variants.length === 1 &&
          product.variants[0]?.title === 'Default Title';

        courseListHTML += `
          <div class="jd-cart-rec-item">
            ${topSavings}
            <div
              class="jd-cart-rec-item-img"
              style="background: url('${product.images[0].src}');"
            >
            </div>
            <div style="flex: 1">
              <div
                class="jd-cart-rec-item-inner"
                style="
                  ${topSavings ? 'padding-top: 30px;' : ''}
                  ${hasSingleVariant ? '' : 'padding-bottom: 10px;'}
                "
              >
                <div>
                  ${programLabel}
                  <div>${product.title}</div>
                </div>
                <div>
                  $${parseFloat(price).toLocaleString(
                    undefined,
                    localeOptions
                  )} USD
                </div>
              </div>
              <div
                class="jd-cart-rec-item-inner-2"
                style="${hasSingleVariant ? 'display: none' : ''}"
              >
                <div>
                  <select class="jd-cart-rec-select jd-cart-rec-item-to-add">
                    ${optionHTML}
                  </select>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      let title = '<h3 class="jd-cart-rec-title">';

      if (matchedBundle.page_link) {
        title += `<a href="${matchedBundle.page_link}">${matchedBundle.name}</a>`;
      } else {
        title += matchedBundle.name;
      }

      title += '</h3>';

      return `
        <div class="jd-cart-rec-wrap" id="bundle-${bundleIndex}">
          <div class="jd-cart-rec">
            <div>Save Buying Together</div>
            ${title}
            <div class="jd-cart-rec-list">
              ${courseListHTML}
            </div>
            <div class="jd-cart-rec-bottom">
              <div class="jd-cart-rec-prices">
                ${cartRecPricesHTML}
              </div>
              <div class="jd-cart-rec-add-wrap">
                <button
                  class="jd-cart-rec-add jd-request-btn hs-button light-button"
                  data-bundle="${bundleIndex}"
                  type="button"
                >
                  Add to cart
                </button>
                ${
                  savings
                    ? `<div>and save $${savings.toLocaleString(
                        undefined,
                        localeOptions
                      )}</div>`
                    : ''
                }
              </div>
            </div>
          </div>
        </div>
      `;
    };

    matchedBundles.forEach((matchedBundle, bundleIndex) => {
      const promise = setBundles(matchedBundle, bundleIndex);

      promises.push(promise);
    });

    let bundleHTML = '';

    try {
      const values = await Promise.all(promises);

      values.forEach((value) => {
        if (value) {
          bundleHTML += value;
        }
      });
    } catch (e) {
      console.error(e);
    }

    try {
      $('.jd-cart-rec-outer').slick('unslick');
    } catch (e) {
      // Slick is not already attached to '.jd-cart-rec-outer'.
    }

    $('.jd-cart-rec-outer').html(bundleHTML);

    $('.jd-cart-rec-outer').show();

    if (window.innerWidth <= sliderBreakSmDesk) {
      const rowFluid = $('.jd-cart-rec-outer').parents('.row-fluid').eq(1);
      const rowStyle = 'width: 100% !important; max-width: 100% !important';

      rowFluid.attr('style', rowStyle);
    }

    const slidesToScroll = 1;

    const slideCommonSettings = {
      centerMode: true,
      centerPadding: '25px',
      slidesToScroll,
    };

    try {
      $('.jd-cart-rec-outer').on('init', () => {
        /**
         * This handler calls a function that references DOM elements which
         * don't exist until after the Slick carousel has been initialized..
         */
        $('.jd-cart-rec-add').click(function () {
          const bundleID = $(this).data('bundle');

          addBundleToCart(bundleID);
        });
      });

      $('.jd-cart-rec-outer').slick({
        slidesToShow: 3,
        slidesToScroll,
        dots: false,
        arrows: false,
        responsive: [
          {
            breakpoint: sliderBreakSmDesk,
            settings: {
              slidesToShow: 2,
              ...slideCommonSettings,
            },
          },
          {
            breakpoint: sliderBreakMobile,
            settings: {
              slidesToShow: 1,
              ...slideCommonSettings,
            },
          },
        ],
      });
    } catch (e) {
      console.error('Slick could not be attached to recommendations.', e);
    }
  }

  /**
   * Sets enrollment agreement URLs as custom attributes on the checkout.
   * @returns {Promise<void>}
   */
  async function setEnrollmentLinks() {
    const cartCookie = IIN.cookies.getCookieString('shopifyCart');

    if (!cartCookie) {
      return;
    }

    const customAttributes = [];

    try {
      const checkout = await IINShopifyClient.checkout.fetch(cartCookie);

      if (!checkout) {
        return;
      }

      if (Array.isArray(checkout.customAttributes)) {
        checkout.customAttributes.forEach(({ key, value }) => {
          customAttributes.push({ key, value });
        });
      }
    } catch (e) {
      console.error(e);
    }

    agreementProducts.forEach((product) => {
      const productID = product.id.replace(gidPath, '');

      let hasAgreement = false;
      let hasAgreementTag = false;
      let agreementPath = 'enrollment-agreement';

      agreementTags.forEach(({ name, pathSuffix }) => {
        if (!hasAgreementTag) {
          product.tags.forEach((productTag) => {
            if (!hasAgreementTag && productTag.value === name) {
              hasAgreementTag = true;
              agreementPath += `-${pathSuffix}`;
            }
          });
        }

        if (!hasAgreement && hasAgreementTag) {
          hasAgreement = true;
        }
      });

      const agreementData = {};

      const books = parseFloat(
        getMetafield(product, 'books_and_materials')?.replace('$', '')
      );

      if (books) {
        agreementData.Books = books.toFixed(2);
      }

      if (product.title) {
        agreementData.Course = product.title;
      }

      [agreementData.Date] = new Date().toISOString().split('T');

      const hours = parseFloat(getMetafield(product, 'number_of_clock_hours'));

      if (hours) {
        agreementData.hours = hours;
      }

      agreementData.Price = product.price.toFixed(2);
      agreementData.ProductId = productID;

      // TODO: How can the value for agreementData.Promo be calculated here?
      // Discounts don't get applied until checkout.

      let discounts = [];
      let discountTotal = 0;

      if (Array.isArray(product.discount_allocations)) {
        discounts = product.discount_allocations;
      }

      discounts.forEach((discount) => {
        discountTotal += parseFloat(discount?.amount || 0);
      });

      if (discountTotal) {
        agreementData.Promo = discountTotal.toFixed(2);
      }

      const publicationDate = getMetafield(
        product,
        'agreement_publication_date'
      );

      if (publicationDate) {
        agreementData.PublicationDate = publicationDate;
      }

      const registrationCost = parseFloat(
        getMetafield(product, 'registration_cost')?.replace('$', '')
      );

      if (registrationCost) {
        agreementData.Registration = registrationCost.toFixed(2);
      }

      const revisionDate = getMetafield(product, 'agreement_revision_date');

      if (revisionDate) {
        agreementData.RevisionDate = revisionDate;
      }

      const startDate = getMetafield(product.variant, 'start_date');

      if (startDate) {
        agreementData.StartDate = startDate;
      }

      const variantTitle =
        product.variant.title === 'Default Title' ? '' : product.variant.title;

      if (variantTitle) {
        agreementData.Variant = variantTitle;
      }

      const weeks = getMetafield(product, 'number_of_weeks');

      if (weeks) {
        agreementData.weeks = weeks;
      }

      const agreementCookie = IIN.cookies.getCookieString(
        'enrollmentAgreementQuery'
      );

      if (agreementCookie) {
        try {
          const separator = '&';

          const cookieParams = IIN.utilities.makeObjectFromKeyValueString(
            agreementCookie,
            separator
          );

          Object.entries(cookieParams).forEach(([key, value]) => {
            if (value) {
              agreementData[key] = value;
            }
          });
        } catch (e) {
          console.error(e);
        }
      }

      const agreementParams = {};

      Object.entries(agreementData).forEach(([key, value]) => {
        const trimmedValue = typeof value === 'number' ? value : value?.trim();

        if (trimmedValue) {
          agreementParams[key] = encodeURIComponent(trimmedValue);
        }
      });

      const agreementOrigin = 'https://course.integrativenutrition.com';
      const agreementURL = new URL(`${agreementOrigin}/${agreementPath}`);

      agreementURL.search =
        IIN.utilities.makeKeyValueStringFromObject(agreementParams);

      const newAttribute = {
        key: `${product.title} Enrollment Agreement`,
        value: agreementURL.toString(),
      };

      customAttributes.push(newAttribute);
    });

    const cartAttributes = { customAttributes };

    try {
      await IINShopifyClient.checkout.updateAttributes(
        cartCookie,
        cartAttributes
      );
    } catch (e) {
      console.error(e);
    }
  }

  /** Executes code that requires DOM elements to already exist. */
  $(() => {
    if (window.innerWidth < sliderBreakMobile) {
      $('.jd-checkout-btn-wrap').appendTo('body');
    }

    const formTarget = '.jd-cart-enrollment-form-target';

    /**
     * Inserts the enrollment agreement form in the DOM.
     * @see {@link https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options How to customize the form embed code}
     */
    hbspt.forms.create({
      region: 'na1',
      portalId: '23273748',
      formId: moduleData?.formID,
      target: formTarget,
      onFormReady() {
        /**
         * Updates checkout email and cookie when the email input value changes.
         * @param {string} value
         * @returns {Promise<void>}
         */
        const updateEmail = async (value) => {
          const cartCookie = IIN.cookies.getCookieString('shopifyCart');

          if (!cartCookie || !value) {
            return;
          }

          const updatedCheckout = await IINShopifyClient.checkout.updateEmail(
            cartCookie,
            value
          );

          await setShopifyCartCookie(updatedCheckout, true);

          checkoutURL = updatedCheckout.webUrl.replace(
            internalDomain,
            externalDomain
          );
        };

        $(`${formTarget} input[name=email]`).change(function () {
          const value = $(this).val();

          updateEmail(value);
        });
      },
      onBeforeFormSubmit($form, data) {
        const address = data.find(({ name }) => name === 'address')?.value;
        const aptField = 'apartment__suite__ect_';
        const address2 = data.find(({ name }) => name === aptField)?.value;
        const city = data.find(({ name }) => name === 'city')?.value;
        const company = data.find(({ name }) => name === 'company')?.value;
        const countryField = 'country_region_dropdown';
        const country = data.find(({ name }) => name === countryField)?.value;
        const email = data.find(({ name }) => name === 'email')?.value;
        const firstName = data.find(({ name }) => name === 'firstname')?.value;
        const lastName = data.find(({ name }) => name === 'lastname')?.value;
        const phone = data.find(({ name }) => name === 'phone')?.value;
        const zip = data.find(({ name }) => name === 'zip')?.value;

        const state = data.find(({ name }) => {
          const words = name?.split('_');
          const lastWord = words[words.length - 1];
          const validWords = ['province', 'state'];

          return validWords.includes(lastWord);
        })?.value;

        /**
         * Sets enrollment agreement URLs and the checkout params cookie.
         * @returns {Promise<void>}
         */
        const addEnrollmentAgreements = async () => {
          const addressValues = [address, address2, state, zip, country];

          let fullAddress = '';

          addressValues.forEach((value) => {
            const trimmedValue = value?.trim();

            if (trimmedValue) {
              fullAddress += `${fullAddress ? ', ' : ''}${trimmedValue}`;
            }
          });

          let fullName = firstName || '';

          if (lastName) {
            fullName += `${firstName ? ' ' : ''}${lastName}`;
          }

          const agreementData = {};

          if (fullName) {
            agreementData.Name = fullName;
          }

          if (email) {
            agreementData.Email = email;
          }

          if (fullAddress) {
            agreementData.Address = fullAddress;
          }

          if (phone) {
            agreementData.Phone = phone;
          }

          const agreementParams = [];

          Object.entries(agreementData).forEach(([key, value]) => {
            const trimmedValue =
              typeof value === 'number' ? value : value?.trim();

            if (trimmedValue || trimmedValue === 0) {
              const encodedParam = encodeURIComponent(`${key}=${trimmedValue}`);

              agreementParams.push(encodedParam);
            }
          });

          const cookieSeparator = '; ';
          const expirationDate = new Date();

          expirationDate.setYear(expirationDate.getFullYear() + 1);

          const agreementCookieData = {
            enrollmentAgreementQuery: agreementParams.join('&'),
            domain: cookieDomain,
            expires: expirationDate.toUTCString(),
          };

          const agreementCookie = IIN.utilities.makeKeyValueStringFromObject(
            agreementCookieData,
            cookieSeparator
          );

          document.cookie = agreementCookie;

          await setEnrollmentLinks();

          const checkoutData = {
            '[email]': email,
          };

          // Properties should stay in this sequence
          const billingAddress = {
            first_name: firstName,
            last_name: lastName,
            phone,
            company,
            address1: address,
            address2,
            city,
            province: state,
            zip,
            country,
          };

          Object.entries(billingAddress).forEach(([key, value]) => {
            const trimmedValue =
              typeof value === 'number' ? value : value?.trim();

            if (trimmedValue) {
              const newKey = `[billing_address][${key}]`;

              checkoutData[newKey] = trimmedValue;
            }
          });

          const checkoutParams = {};

          Object.entries(checkoutData).forEach(([key, value]) => {
            const newKey = `checkout${key}`;

            if (value) {
              checkoutParams[newKey] = encodeURIComponent(value);
            }
          });

          const checkoutCookieData = {
            checkoutQuery: encodeURIComponent(JSON.stringify(checkoutParams)),
            domain: cookieDomain,
            expires: expirationDate.toUTCString(),
          };

          const checkoutCookie = IIN.utilities.makeKeyValueStringFromObject(
            checkoutCookieData,
            cookieSeparator
          );

          document.cookie = checkoutCookie;
        };

        addEnrollmentAgreements();
      },
      onFormSubmit() {
        $('.jd-cart-enrollment').removeClass('jd-cart-enrollment-show');

        const intervalDuration = 50;
        const maximumAttempts = 100;
        let attempts = 0;

        /**
         * An async function is awaited in onBeforeSubmit that must resolve in
         * order to set the checkoutQuery cookie.
         */
        const cookieInterval = setInterval(() => {
          const checkoutCookie = IIN.cookies.getCookieObject('checkoutQuery');

          if (!checkoutCookie && attempts === maximumAttempts) {
            console.error('Checkout cookie could not be found.');
            clearInterval(cookieInterval);
            return;
          }

          if (!checkoutCookie) {
            attempts++;
            return;
          }

          clearInterval(cookieInterval);
          window.location.href = getStoreURL();
        }, intervalDuration);
      },
    });

    $(window).on('resize', () => {
      if (
        window.innerWidth <= sliderBreakMobile &&
        currentWidth > sliderBreakMobile
      ) {
        $('.jd-checkout-btn-wrap').appendTo('body');
      } else if (
        window.innerWidth > sliderBreakMobile &&
        currentWidth <= sliderBreakMobile
      ) {
        $('.jd-checkout-btn-wrap').appendTo('.jd-cart-summary-outer');
      }

      const $rowFluid = $('.jd-cart-rec-outer').parents('.row-fluid').eq(1);

      if (
        window.innerWidth <= sliderBreakSmDesk &&
        currentWidth > sliderBreakSmDesk
      ) {
        const rowStyle = 'width: 100% !important; max-width: 100% !important';

        $rowFluid.attr('style', rowStyle);
      } else if (
        window.innerWidth > sliderBreakSmDesk &&
        currentWidth <= sliderBreakSmDesk
      ) {
        $rowFluid.attr('style', '');
      }

      currentWidth = window.innerWidth;
    });

    $('.jd-cart-enrollment-form-btn').click(() => {
      $('.jd-cart-enrollment').removeClass('jd-cart-enrollment-show');
    });

    $('.jd-cart-enrollment').appendTo('body');

    $('#jd-checkout-btn').click(() => {
      const checkoutCookie = IIN.cookies.getCookieObject('checkoutQuery');

      if (agreementProducts.length && !checkoutCookie) {
        $('.jd-cart-enrollment').addClass('jd-cart-enrollment-show');
      } else {
        window.location.href = getStoreURL();
      }
    });

    initializeCart();
  });
})();
