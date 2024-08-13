(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('course_shopify_add_to_cart');

    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.error(e);
    return;
  }

  const msToCloseAddPopUp = 8000;
  const optionKeys = [];
  const selectedOptions = {};
  let product;
  let displaySlashPrice;
  let displayPrice;
  let displayDiscount;

  /**
   * @param {string} productData
   * @param {Object|null} productData
   */
  const getSelectedVariant = (productData) => {
    const selectedVariant = productData.variants.find((variant) => {
      const variantOptions = variant?.selectedOptions || [];

      if (
        !variant?.available ||
        !Array.isArray(variantOptions) ||
        !variantOptions.length
      ) {
        return false;
      }

      let isMatch = true;

      variantOptions?.forEach(({ name, value }) => {
        const selectedValue = selectedOptions[name];

        if (selectedValue !== value) {
          isMatch = false;
        }
      });

      return isMatch;
    });

    return selectedVariant || null;
  };

  /**
   * Return a list of possible variants given a selection of options.
   */
  const getPossibleVariants = (variants, selection) =>
    variants.filter((variant) => {
      if (!variant.available) {
        return false;
      }

      return !variant.selectedOptions.some((variantOption) => {
        return (
          selection[variantOption.name] !== undefined &&
          selection[variantOption.name] !== variantOption.value
        );
      });
    });

  /**
   * Returns a Set of possible values given a list of variants and an option key.
   */
  const getPossibleValues = (variants, optionName) => {
    const possibleValues = new Set();
    variants.forEach((variant) => {
      variant.selectedOptions.forEach((variantOption) => {
        if (variantOption.name === optionName) {
          possibleValues.add(variantOption.value);
        }
      });
    });
    return possibleValues;
  };

  /**
   * Return an options object given the current selection, a list of option names,
   * and a list of variants.
   */
  const getOptions = (selection, optionNames, variants) => {
    const options = {};
    const newSelection = {};
    let filteredVariants = [...variants];

    // Iterate through option names
    optionNames.forEach((optionName) => {
      // Get all possible values for each name from a list of variants
      options[optionName] = getPossibleValues(filteredVariants, optionName);

      // If currently selected value is no longer possible
      // set the new selection to a default (first value).
      if (!options[optionName].has(selection[optionName])) {
        newSelection[optionName] = [...options[optionName]][0];
      } else {
        newSelection[optionName] = selection[optionName];
      }

      // Filter the list of variants to match the current selection.
      filteredVariants = getPossibleVariants(filteredVariants, newSelection);
    });

    return { options, newSelection };
  };

  /**
   * Updates selectedOptions and show/hide buttons when an attribute is changed.
   */
  const checkSelectedOptions = () => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const { options, newSelection } = getOptions(
      selectedOptions,
      optionKeys,
      variants,
    );
    optionKeys.forEach((optionKey) => {
      selectedOptions[optionKey] = newSelection[optionKey];
    });

    // Checkboxes
    let html = '<form class="jd-shopify-options">';

    const firstVariantTitle = options[optionKeys[0]]?.[0];

    // Not showing options if there is only 1 default field
    if (firstVariantTitle !== 'Default Title') {
      optionKeys.forEach((optionKey) => {
        html += `
          <div>
            <div class="jd-buy-option-label">
              ${optionKey}
            </div>
            <div class="jd-shopify-option-wrap">
        `;

        const values = options[optionKey] || [];

        values.forEach((value) => {
          const inputID = `${optionKey.replace(/ /g, '_')}_${value.replace(/ /g, '_')}`;
          html += `
            <div>
              <input
                id="${inputID}"
                value="${value}"
                name="${optionKey}"
                ${value === selectedOptions[optionKey] ? 'checked="true"' : ''}
                type="radio"
              />
              <label for="${inputID}">${value}</label>
            </div>
          `;
        });

        html += '</div></div>';
      });
    }

    html += '</form>';

    // Adding options to bottom middle section
    $('.pdp-bottom-options').html(html);

    let priceHTML = '';
    if (displayPrice) {
      let slashHTML = '';
      let fullPriceHTML = '';
      if (displayDiscount) {
        fullPriceHTML = `
          <div class="pdp-price">
            <div class="pdp-price-total">${displayPrice}</div>
            <div class="pdp-price-discount">${displayDiscount}</div>
          </div>
        `;
      } else {
        fullPriceHTML = `
          <div class="pdp-price">
            <div class="pdp-price-total">${displayPrice}</div>
          </div>
        `;
      }
      if (displaySlashPrice) {
        slashHTML = `
          <div class="pdp-slash">${displaySlashPrice}</div>
        `;
      }
      priceHTML = `
        <div class="pdp-price-wrap">
          ${slashHTML}
          ${fullPriceHTML}
        </div>
      `;
    }

    // Adding price and button to bottom right sections
    const bottomRightHTML = `
      <div class="pdp-div"></div>
      <div class="pdp-price-button-wrap">
        ${priceHTML}
        <div class="pdp-price-button">
          <button
            class="jd-shopify-add-btn jd-request-btn hs-button light-button"
            type="button"
          >
            Add to Cart
            <i class="fa-regular fa-circle-arrow-right" style="padding-left: 10px;"></i>
          </button>
        </div>
      </div>
      <div style="display: none" class="jd-shopify-add-exists-msg">
        This course is already in your cart
      </div>
    `;
    $('.pdp-bottom-price').html(bottomRightHTML);

    html += `
      <div class="pdp-div"></div>
      <div class="pdp-price-button-wrap">
        ${priceHTML}
        <div class="pdp-price-button">
          <button
            class="jd-shopify-add-btn jd-request-btn hs-button light-button"
            type="button"
          >
            Enroll
          </button>
        </div>
      </div>
      <div style="display: none" class="jd-shopify-add-exists-msg">
        This course is already in your cart
      </div>
    `;

    $(`.pdp-options`).html(html);

    // Option click checkbox
    $(`.jd-shopify-option-wrap input[type=radio]`).change(function (e) {
      e.preventDefault();
      const type = $(this).attr('name');
      const val = $(this).val();
      const parent = $(this).data('parent');

      selectedOptions[type] = val;
      checkSelectedOptions();

      const $checkedInputs = $(
        `.${parent} .jd-shopify-option-wrap input[name="${type}"]:checked`,
      );

      $checkedInputs.first().focus();
    });

    $('.jd-shopify-option-wrap label').click(function (e) {
      e.preventDefault();
      const checkbox = $(this).attr('for');
      $(`#${checkbox}`).first().trigger('click');
    });

    /**
     * Adds a product to the cart.
     * @param {Object} productData
     * @returns {Promise<void>}
     */
    const addToCart = async (productData) => {
      const selectedVariant = getSelectedVariant(productData);

      if (!selectedVariant) {
        // TODO: replace "alert" with alternative UX choice, pop-up, or message.
        alert('This combination of options is invalid');
      } else {
        const cartCookie = IIN.cookies.getCookieString('shopifyCart');
        const checkout = await IINShopifyClient.checkout.fetch(cartCookie);

        const alreadyInCart = checkout.lineItems.some(
          ({ variant }) => variant.product.id === productData.id,
        );

        if (alreadyInCart) {
          $(`.jd-shopify-add-exists-msg`).show();
          return;
        }

        $(`.jd-shopify-add-exists-msg`).hide();

        const lineItemsToAdd = [
          {
            variantId: selectedVariant.id,
            quantity: 1,
          },
        ];

        try {
          const updatedCheckout = await IINShopifyClient.checkout.addLineItems(
            cartCookie,
            lineItemsToAdd,
          );

          updateCartTotal(updatedCheckout);

          $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
          $('.jd-blackout').addClass('jd-blackout-show');
          $('.jd-add-pop .jd-add-pop-cat').text(`${moduleData.category}`);
          $('.jd-add-pop .jd-add-pop-name').text(`${moduleData.courseName}`);
          $('.jd-add-pop .jd-add-pop-img > div').attr(
            'style',
            `background: url(${selectedVariant.image.src})`,
          );

          let optionsHTML = '';

          Object.entries(selectedOptions).forEach(([key, value]) => {
            if (value) {
              optionsHTML += `<div><strong>${key}:</strong> ${value}</div>`;
            }
          });

          $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);

          const amount = parseFloat(selectedVariant.price?.amount) || 0;
          const currencyCode = selectedVariant.price?.currencyCode || 'USD';

          if (amount || amount === 0) {
            $('.jd-add-pop .jd-add-pop-price').text(
              `$${amount.toLocaleString()}`,
            );
          }

          const headerHeight = $('.jd-header-wrap').outerHeight();

          $('.jd-add-pop').css('top', `${headerHeight}px`);
          $('.jd-add-pop').addClass('jd-add-pop-show');

          setTimeout(() => {
            $('.jd-blackout').removeClass('jd-blackout-show');
            $('.jd-add-pop').removeClass('jd-add-pop-show');
          }, msToCloseAddPopUp);

          let couponTitle = 0;
          let discountAmount = 0;
          const anyVariant = product.variants[0];

          if (
            anyVariant.discountAllocations &&
            anyVariant.discountAllocations.length > 0
          ) {
            anyVariant.discountAllocations.forEach((discountAllocation) => {
              if (
                discountAllocation &&
                discountAllocation.discountApplication
              ) {
                couponTitle = discountAllocation.discountApplication.title;
                discountAmount = discountAllocation.allocatedAmount.amount;
              }
            });
          }

          const addItemtoCart = {
            event: 'add_to_cart',
            ecommerce: {
              currency: currencyCode,
              value: parseFloat(product.variants[0].price.amount),
              product_type: 'Individual',
              coupon: couponTitle,
              items: [
                {
                  item_id: product.id.match(/\/(\d+)$/)[1],
                  item_name: product.title,
                  item_type: product.productType,
                  variant_id: product.variants[0].id.match(/\/(\d+)$/)[1],
                  price: parseFloat(product.variants[0].price.amount),
                  discount: discountAmount,
                  quantity: 1,
                  sku: product.variants[0].sku || 'NA',
                },
              ],
            },
          };
          triggerECommEvent(addItemtoCart);
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Add to cart button click.
    $(`.jd-shopify-add-btn`).click(() => {
      addToCart(product);
    });
  };

  /**
   * Gets data for a product from Shopify.
   * @returns {Promise<void>}
   */
  const getProductData = async () => {
    try {
      const gidPath = `gid://shopify/Product/${moduleData.productID}`;

      product = await IINShopifyClient.product.fetch(gidPath);

      const variant = product.variants?.find(({ available }) => {
        if (available) {
          return true;
        }

        return false;
      });

      const options = variant?.selectedOptions;

      if (Array.isArray(options) && options.length) {
        options.forEach(({ name, value }) => {
          // Keeping keys in an array to preserve order.
          optionKeys.push(name);
          selectedOptions[name] = value;
        });
      }

      // Creating throwaway cart to get price after discount
      const checkout = await IINShopifyClient.checkout.create();
      const lineItems = [
        {
          variantId: variant.id,
          quantity: 1,
        },
      ];
      await IINShopifyClient.checkout.addLineItems(checkout.id, lineItems);
      const updatedCheckout = await IINShopifyClient.checkout.fetch(
        checkout.id,
      );
      const applications = updatedCheckout?.discountApplications;
      const discounts = Array.isArray(applications) ? applications : [];
      const totalAfterDiscount = parseFloat(updatedCheckout.totalPrice?.amount);
      let total = totalAfterDiscount > -1 ? totalAfterDiscount : 0;

      discounts.forEach(({ value }) => {
        const amount = parseFloat(value?.amount) || 0;
        total += amount;
      });

      displayPrice = `$${totalAfterDiscount.toLocaleString()}`;

      if (totalAfterDiscount < total) {
        displaySlashPrice = `$${total.toLocaleString()}`;
        const percentageOff = Math.round(
          ((total - totalAfterDiscount) / total) * 100,
        );
        displayDiscount = `-${percentageOff}%`;
      }

      checkSelectedOptions();
    } catch (e) {
      console.error(e);
    }
  };

  getProductData();

  /* Sticky nav */
  $('.pdp-sticky-wrap').appendTo('body');

  $('#pdp-sticky-enroll-btn').click((e) => {
    e.preventDefault();
    $('.caret').toggleClass('caret-down');
    $('.caret').toggleClass('caret-up');
    $('.pdp-sticky-header-wrap').toggleClass('sticky-header-shadow');
    $('.pdp-sticky-wrap').toggleClass('pdp-sticky-enroll-show');
  });

  /* Slides */
  const changeSlide = (index) => {
    $('.pdp-top-slide-btn').removeClass('pdp-top-slide-btn-active');
    $('.pdp-top-slide-slide').removeClass('pdp-top-slide-slide-active');
    $('.pdp-top-slide-dot').removeClass('pdp-top-slide-dot-active');
    $(`#pdp-top-slide-btn-${index}`).addClass('pdp-top-slide-btn-active');
    $(`#pdp-top-slide-slide-${index}`).addClass('pdp-top-slide-slide-active');
    $(`#pdp-top-slide-dot-${index}`).addClass('pdp-top-slide-dot-active');
  };

  $('.pdp-top-slide-btn').click(function () {
    if (!$(this).hasClass('pdp-top-slide-btn-active')) {
      changeSlide($(this).data('index'));
    }
  });

  $('.pdp-top-slide-dot').click(function () {
    if (!$(this).hasClass('pdp-top-slide-dot-active')) {
      changeSlide($(this).data('index'));
    }
  });

  let stickyHeader;
  let body;

  function getCurrentHeight() {
    if (!stickyHeader) {
      stickyHeader = document.querySelector('.pdp-sticky');
    }

    if (!body) {
      body = document.body;
    }

    const height = stickyHeader.offsetHeight;

    body.style.paddingTop = `${height}px`;
    return height;
  }

  // Call the function on load to get the current height
  window.addEventListener('DOMContentLoaded', getCurrentHeight);

  // Call the function on resize (to handle responsive changes)
  window.addEventListener('resize', getCurrentHeight);
})();
