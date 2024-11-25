const getProductSelectionMethods = () => {
  /**
   * Returns the selected variant or null if one is not found.
   * @param {string} productData
   * @param {Object|null} productData
   */
  const getSelectedVariant = (productData, currentOptions) => {
    const selectedVariant = productData.variants.find((variant) => {
      const variantOptions = variant?.selectedOptions || [];

      if (
        !IIN.shopify.isAvailable(variant) ||
        !Array.isArray(variantOptions) ||
        !variantOptions.length
      ) {
        return false;
      }

      let isMatch = true;

      variantOptions?.forEach(({ name, value }) => {
        const selectedValue = currentOptions[name];

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
      if (!IIN.shopify.isAvailable(variant)) {
        return false;
      }

      return !variant.selectedOptions.some(
        (variantOption) =>
          selection[variantOption.name] !== undefined &&
          selection[variantOption.name] !== variantOption.value,
      );
    });

  /**
   * Returns a Set of possible values given a list of variants and an option key.
   */
  const getPossibleValues = (variants, optionName) => {
    const possibleValues = new Set();
    variants.forEach((variant) => {
      variant?.selectedOptions.forEach((variantOption) => {
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
    let filteredVariants = getPossibleVariants(variants, newSelection);

    // Iterate through option names
    optionNames.forEach((optionName) => {
      // Get all possible values for each name from a list of variants
      options[optionName] = getPossibleValues(filteredVariants, optionName);

      // If currently selected value is no longer possible
      // set the new selection to a default (first value).
      if (!options[optionName].has(selection[optionName])) {
        [newSelection[optionName]] = [...options[optionName]];
      } else {
        newSelection[optionName] = selection[optionName];
      }

      // Filter the list of variants to match the current selection.
      filteredVariants = getPossibleVariants(filteredVariants, newSelection);
    });

    return { options, newSelection };
  };

  /**
   * Gets data for a product from Shopify.
   * @returns {Promise<Object>}
   */
  const getProductData = (productId) => {
    const gidPath = IIN.shopify.buildGlobalProductId(productId);
    return IIN.shopify.fetchProduct(gidPath);
  };

  /**
   * Process a product and its variants for options and a default selection
   * @param {Object} product
   * @returns {Object}
   */
  const processProduct = (product) => {
    const variant = IIN.shopify.getFirstAvailableVariant(product);
    const options = variant?.selectedOptions;
    const productOptions = [];
    const variantSelections = {};

    if (Array.isArray(options)) {
      options.forEach(({ name, value }) => {
        // Keeping keys in an array to preserve order.
        productOptions.push(name);
        variantSelections[name] = value;
      });
    }

    return { productOptions, variantSelections };
  };

  const showAddedToCartPopUp = (info) => {
    const msToCloseAddPopUp = 8000;
    const { action, checkout, module, selectedOptions, variant } = info;

    updateCartTotal(checkout);

    $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
    $('.jd-blackout').addClass('jd-blackout-show');
    $('.jd-add-pop .jd-add-pop-cat').text(`${module.category}`);
    $('.jd-add-pop .jd-add-pop-name').text(`${module.courseName}`);

    if (action === 'already-in-cart') {
      const message = document.querySelector('.jd-add-pop .jd-add-pop-message');
      message.classList.add('jd-shopify-add-exists-msg');
      message.classList.remove('check-before');
      const errorText = document.createTextNode(
        'This course is already in your cart',
      );
      message.replaceChildren(errorText);
    }

    // this errors if the product doesn't have an image
    try {
      $('.jd-add-pop .jd-add-pop-img > div').attr(
        'style',
        `background: url(${variant.image.src})`,
      );
    } catch (error) {
      console.error(error);
    }

    let optionsHTML = '';

    Object.entries(selectedOptions).forEach(([key, value]) => {
      const isDefaultTitle = value === 'Default Title';

      if (value && !isDefaultTitle) {
        optionsHTML += `<div><strong>${key}</strong> ${value}</div>`;
      }
    });

    $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);

    const originalAmount = parseFloat(variant.price?.amount) || 0;
    let amount = originalAmount;

    const checkoutVariant = checkout.lineItems.find(
      (lineItem) => lineItem.variant.id === variant.id,
    );

    const discounts = checkoutVariant?.discountAllocations;

    if (Array.isArray(discounts)) {
      discounts.forEach(({ allocatedAmount }) => {
        amount -= parseFloat(allocatedAmount?.amount) || 0;
      });
    }

    if (amount || amount === 0) {
      $('.jd-add-pop .jd-add-pop-price').text(`$${amount.toLocaleString()}`);
    }

    if (originalAmount && amount !== originalAmount) {
      $('.add-pop-price-original').text(`$${originalAmount.toLocaleString()}`);
    }

    const headerHeight = $('.jd-header-wrap').outerHeight();
    const $popUp = $('.jd-add-pop');
    $popUp.css('top', `${headerHeight}px`);
    $popUp.addClass('jd-add-pop-show');

    setTimeout(() => {
      $('.jd-blackout').removeClass('jd-blackout-show');
      $popUp.removeClass('jd-add-pop-show');
    }, msToCloseAddPopUp);
  };

  /**
   * Adds a product to the cart.
   * @param {Object} productData
   * @returns {Promise<void>}
   */
  const addToCart = async (productData, moduleInfo, selectedOptions) => {
    const selectedVariant = getSelectedVariant(productData, selectedOptions);

    if (!selectedVariant) {
      // TODO: replace "alert" with alternative UX choice, pop-up, or message.
      alert('This combination of options is invalid');
      return undefined;
    }

    const cartCookie = IIN.shopify.getCheckoutCookie();
    const checkout = await IINShopifyClient.checkout.fetch(cartCookie);
    const alreadyInCart = IIN.shopify.isProductInCheckout(
      checkout,
      productData.id,
    );

    // We could use .body-wrapper as a filter, but that only works if we assume
    // the header is appended directly to the body, as is currently the case.
    const errorSelector = `.jd-shopify-add-exists-msg`;
    const headerErrorMessage = document.querySelector(
      `.pdp-sticky-enroll ${errorSelector}`,
    );
    const $errorMessages = $(errorSelector).filter(
      (index, element) => element !== headerErrorMessage,
    );

    if (alreadyInCart) {
      const hasCohorts = IIN.shopify.getHasCohorts(productData);

      if (hasCohorts) {
        $errorMessages.show();
      }

      showAddedToCartPopUp({
        checkout,
        selectedOptions,
        variant: selectedVariant,
        module: moduleInfo,
        action: 'already-in-cart',
      });

      return undefined;
    }

    $errorMessages.hide();

    // TODO: is productData.productType valid?
    const customAttributes = [
      { key: 'productType', value: productData.productType || 'NA' },
    ];

    const newLineItem = IIN.shopify.createCheckoutLineItem(
      selectedVariant.id,
      customAttributes,
    );

    try {
      const updatedCheckout = await IINShopifyClient.checkout.addLineItems(
        cartCookie,
        [newLineItem],
      );

      showAddedToCartPopUp({
        selectedOptions,
        checkout: updatedCheckout,
        module: moduleInfo,
        variant: selectedVariant,
      });

      return selectedVariant;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  /** Data layer tracking */
  const trackAddToCart = (variant, moduleInfo, productInfo) => {
    const currencyCode = variant.price?.currencyCode || 'USD';
    const addedVariantPrice = parseFloat(variant.price?.amount || 0.0);
    const variantGidPath = 'gid://shopify/ProductVariant/';

    let couponTitle = 'NA';
    let discountAmount = 0;

    if (Array.isArray(variant.discountAllocations)) {
      variant.discountAllocations.forEach((discountAllocation) => {
        couponTitle = discountAllocation?.discountApplication?.title;
        discountAmount = discountAllocation?.allocatedAmount?.amount;
      });
    }

    const addItemToCart = {
      event: 'add_to_cart',
      ecommerce: {
        currency: currencyCode,
        value: addedVariantPrice,
        product_type: 'Individual',
        coupon: couponTitle,
        items: [
          {
            item_id: getCustomItemId(
              moduleData.productID,
              variant.id.replace(variantGidPath, ''),
            ),
            item_name: productInfo.title,
            item_type: productInfo.productType,
            variant_id: variant.id.replace(variantGidPath, ''),
            price: addedVariantPrice,
            discount: discountAmount,
            quantity: 1,
            sku: variant.sku || 'NA',
            url: productInfo.handle,
            image_url: variant.image?.src || '',
          },
        ],
      },
    };

    try {
      triggerECommEvent(addItemToCart);
    } catch (error) {
      console.error(error);
    }
  };

  const createViewItemEvent = (productData, matchedVariant, moduleData) => {
    const variantGidPath = 'gid://shopify/ProductVariant/';
    const itemPrice = parseFloat(matchedVariant.price?.amount || 0.0);

    let couponTitle = 'NA';
    let discountAmount = 0;

    if (Array.isArray(matchedVariant.discountAllocations)) {
      matchedVariant.discountAllocations.forEach((discountAllocation) => {
        couponTitle = discountAllocation?.discountApplication?.title;
        discountAmount = discountAllocation?.allocatedAmount?.amount;
      });
    }

    const viewItemPayLoad = {
      event: 'view_item',
      ecommerce: {
        product_type: 'Individual',
        currency: matchedVariant.price.currencyCode,
        value: parseFloat(itemPrice),
        coupon: couponTitle,
        items: [
          {
            item_id: getCustomItemId(
              moduleData.productID,
              matchedVariant.id.replace(variantGidPath, ''),
            ),
            item_name: productData.title,
            item_type: productData.productType || 'NA',
            variant_id: matchedVariant.id.replace(variantGidPath, ''),
            price: parseFloat(itemPrice),
            sku: matchedVariant.sku || 'NA',
            discount: discountAmount,
            quantity: productData?.quantity || 1,
            vendor: productData.vendor,
            url: productData.handle,
            image_url: matchedVariant.image?.src || '',
            compare_at_price: matchedVariant.compareAtPrice || '',
          },
        ],
      },
    };

    try {
      triggerECommEvent(viewItemPayLoad);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Calculate Shopify discount info
   * @param {Object} variant
   * @returns
   */
  const calculateDiscounts = async (variant) => {
    // Create checkout and add line items
    const checkout = await IINShopifyClient.checkout.create();

    const lineItems = [
      {
        variantId: variant.id,
        quantity: 1,
      },
    ];

    const updatedCheckout = await IINShopifyClient.checkout.addLineItems(
      checkout.id,
      lineItems,
    );

    const total =
      parseFloat(updatedCheckout.lineItemsSubtotalPrice?.amount) || 0;

    const totalAfterDiscount =
      parseFloat(updatedCheckout.totalPrice?.amount) || 0;

    // Format the discounted price to be displayed
    const displayPrice = `$${totalAfterDiscount.toLocaleString()}`;

    let displayDiscount;
    let displaySlashPrice;

    // Check if a discount was applied and calculate the percentage off
    if (totalAfterDiscount < total) {
      const percentageOff = Math.round(
        ((total - totalAfterDiscount) / total) * 100,
      );

      displayDiscount = `-${percentageOff}%`;
      displaySlashPrice = `$${total.toLocaleString()}`;
    }

    return { displaySlashPrice, displayPrice, displayDiscount };
  };

  /**
   * Localizes dynamic variant option text
   * Fire and forget.
   * @param {element} label element to insert translation
   * @param {string} labelValue string to translate
   * @returns {Promise<void>}
   */
  const localizeOptionLabel = async (label, labelValue) => {
    let nodes = [label];
    let text = labelValue;
    // If page is Spanish and Weglot is initialized, manually translate labels
    if (document.documentElement.lang === 'es' && Weglot?.initialized) {
      try {
        // Set localization key to select on after translation
        const localizationKey = `localize-${text}`;
        label.setAttribute('data-localize', localizationKey);
        const TRANSLATION_TYPE = 1;
        const translation = await Weglot.translate({
          words: [{ t: TRANSLATION_TYPE, w: text }],
          languageTo: 'es',
        });
        [text] = translation;
        nodes = document.querySelectorAll(
          `[data-localize="${localizationKey}"]`,
        );
      } catch (e) {
        console.error(`Error translating option label: ${e}`);
      }
    }
    // Specifically rerender all nodes with data-localize to accomodate PDP Bottom hack
    nodes.forEach((node) => {
      labelTextNode = document.createTextNode(text);
      node.appendChild(labelTextNode);
    });
  };

  /**
   * Create the label for a group of options
   * @param {string} text selectable product option
   * @returns {HTMLDivElement}
   */
  const createOptionLabel = (text) => {
    const div = document.createElement('div');
    div.classList.add('jd-buy-option-label');
    localizeOptionLabel(div, text);
    return div;
  };

  /**
   * Create Input/Label pair for selecting an option
   * @param {string} key option name
   * @param {string} value option value
   * @param {Object} selected selected options for comparison
   * @param {boolean} normalize whether to normalize id strings
   * @returns
   */
  const createInputPair = (key, value, selected, normalize = false) => {
    const replaceSpaces = (string) => string.replaceAll(' ', '_');
    const compositeKey = normalize
      ? `${replaceSpaces(key)}_${replaceSpaces(value)}`
      : `${key}_${value}`;
    const div = document.createElement('div');
    div.classList.add('jd-shopify-option');
    const input = document.createElement('input');
    input.setAttribute('id', compositeKey);
    input.setAttribute('value', value);
    input.setAttribute('name', key);
    input.setAttribute('type', 'radio');

    if (value === selected[key]) {
      input.setAttribute('checked', true);
    }

    const label = document.createElement('label');
    label.setAttribute('for', compositeKey);

    // async fire and forget
    localizeOptionLabel(label, value);
    div.append(input, label);
    return div;
  };

  /**
   * Create DOM button for add to cart functionality
   * @param {string} text Button text
   * @returns {HTMLButtonElement}
   */
  const createAddToCartButton = (text = 'Add to Cart') => {
    const button = document.createElement('button');
    button.classList.add(
      'jd-shopify-add-btn',
      'jd-request-btn',
      'hs-button',
      'light-button',
    );
    button.setAttribute('type', 'button');
    const textNode = document.createTextNode(text);
    button.appendChild(textNode);
    return button;
  };

  /**
   * Create a DOM node to show error messages
   * @returns {HTMLDivElement}
   */
  const createErrorBlock = () => {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('jd-shopify-add-exists-msg');
    errorMessage.setAttribute('style', 'display: none;');
    const errorText = document.createTextNode(
      'This course is already in your cart',
    );
    errorMessage.appendChild(errorText);
    return errorMessage;
  };

  /**
   * Create DOM nodes to display discount info
   * @param {Object} discountInfo discount info to display
   * @returns {HTMLDivElement|DocumentFragment}
   */
  const createDiscountNodes = ({
    displaySlashPrice,
    displayPrice,
    displayDiscount,
  }) => {
    if (!displayPrice) {
      return document.createDocumentFragment();
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('pdp-price-wrap');

    const priceDiv = document.createElement('div');
    priceDiv.classList.add('pdp-price');

    const total = document.createElement('div');
    total.classList.add('pdp-price-total');
    const priceText = document.createTextNode(displayPrice);
    total.appendChild(priceText);
    priceDiv.appendChild(total);

    if (displayDiscount) {
      const discount = document.createElement('div');
      discount.classList.add('pdp-price-discount');
      const discountText = document.createTextNode(displayDiscount);
      discount.appendChild(discountText);
      priceDiv.appendChild(discount);
    }

    if (displaySlashPrice) {
      const slashPrice = document.createElement('div');
      slashPrice.classList.add('pdp-slash');
      const slashText = document.createTextNode(displaySlashPrice);
      slashPrice.appendChild(slashText);
      wrapper.appendChild(slashPrice);
    }

    wrapper.appendChild(total);
    return wrapper;
  };

  /**
   * Configure header behavior
   * Append the header to body to avoid interrupting screen reader content
   * @param {boolean} isDefault configure header for default page or sample class
   */
  const configureStickyNav = (isDefault = true, usePrepend = false) => {
    const $target = $('.pdp-sticky-wrap');

    if (usePrepend) {
      $target.prependTo('body');
    } else {
      $target.appendTo('body');
    }

    const handleEnrollButtonClick = (event) => {
      event.preventDefault();
      $('.caret').toggleClass('caret-down');
      $('.caret').toggleClass('caret-up');
      $('.pdp-close-product-selector').toggleClass('hide');
      $('.pdp-close-product-selector').toggleClass('show');
      $('.pdp-sticky-inner').toggleClass('expanded');
      $('.pdp-sticky-wrap').toggleClass('pdp-sticky-enroll-show');
      $('.pdp-sticky-header-wrap').toggleClass('sticky-header-shadow');
    };

    $('#pdp-sticky-enroll-btn').click(handleEnrollButtonClick);
    $('#pdp-close-product-selector').click(handleEnrollButtonClick);
  };

  const configureStickyHeaderSampleClass = () => {
    configureStickyNav(false, true);
  };

  /**
   * Configure header toggle functionality
   * @param {boolean} useIdTrigger whether to use id as trigger
   */
  const configureHeaderToggle = (useIdTrigger, useDynamicTrigger) => {
    const defaultSelector = `.pdp-top`;
    let triggerSelector;

    if (useIdTrigger) {
      triggerSelector = `#product-selector-trigger`;
    } else if (useDynamicTrigger) {
      triggerSelector = `#dynamic-product-selector-trigger`;
    } else {
      triggerSelector = defaultSelector;
    }

    const trigger =
      document.querySelector(triggerSelector) ??
      document.querySelector(defaultSelector);

    if (!trigger) {
      throw new Error(`configureHeaderToggle: Failed to find trigger element`);
    }

    const stickySelector = '.pdp-sticky-wrap';
    const stickyWrap = document.querySelector(stickySelector);

    if (!stickyWrap) {
      throw new Error(
        `configureHeaderToggle: Failed to find sticky wrap with selector: ${stickySelector}`,
      );
    }

    const showClass = 'pdp-sticky-show';

    const handleScroll = () => {
      const { scrollY } = window;
      const { height, top } = trigger.getBoundingClientRect();
      const bottom = height + top + scrollY;
      const hasShowClass = stickyWrap.classList.contains(showClass);

      if (scrollY > bottom && !hasShowClass) {
        stickyWrap.classList.add(showClass);
      } else if (scrollY < bottom && hasShowClass) {
        stickyWrap.classList.remove(showClass);
      }
    };

    window.addEventListener('scroll', IIN.helpers.throttle(handleScroll));
  };

  /**
   * Configure image slider
   */
  const configureImageSlider = () => {
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
  };

  /**
   * Create the inputs for choosing the product options like language or start date
   * @param {string[]} optionNames
   * @param {*} allOptions
   * @param {Object} selectedOptions
   * @param {Map<string, Map<string, Object>>}
   * @returns {HTMLElement}
   */
  const createOptionNodes = (
    optionNames,
    allOptions,
    selectedOptions,
    valuesMapByOptionName,
  ) => {
    const fragment = document.createDocumentFragment();
    const hasMultipleOptions = optionNames.length > 1;

    optionNames.forEach((key, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.classList.add('jd-buy-option');
      const prefix = hasMultipleOptions ? `${index + 1}. ` : '';
      const labelDiv = createOptionLabel(`${prefix}${key}`);
      optionDiv.appendChild(labelDiv);
      fragment.appendChild(optionDiv);

      // Configure option value inputs
      const optionWrap = document.createElement('div');
      optionWrap.classList.add('jd-shopify-option-wrap');
      optionDiv.appendChild(optionWrap);
      const valuesSet = allOptions[key];
      valuesSet.forEach((value) => {
        const pair = createInputPair(key, value, selectedOptions, true);
        optionWrap.appendChild(pair);
      });

      if (!(valuesMapByOptionName && valuesMapByOptionName.has(key))) {
        return;
      }

      const inputs = optionWrap.querySelectorAll('input');
      if (!inputs.length) {
        return;
      }

      const checked = Array.prototype.find.call(inputs, (input) =>
        input.getAttribute('checked'),
      );
      const { value } = checked;
      const valueDataByValueName = valuesMapByOptionName.get(key);

      // `description` must match shopify Metaobject field name
      const description = valueDataByValueName.get(value)?.description;
      if (description) {
        const paragraph = document.createElement('p');
        paragraph.classList.add('selected-value-description');
        const text = document.createTextNode(description);
        paragraph.appendChild(text);
        optionDiv.appendChild(paragraph);
      }
    });

    return fragment;
  };

  /**
   * Parse product data set in the session storage from the server-side hubl
   * @returns {Object}
   */
  const parseMarkupData = () => {
    const rawData = IIN.shopify.getAddToCartSessionData();
    return JSON.parse(rawData);
  };

  /**
   * Configure added to cart popup functionality
   */
  const configureAddedToCartPopUp = () => {
    $('.jd-add-pop-close').click(() => {
      $('.jd-add-pop').removeClass('jd-add-pop-show');
    });
  };

  /**
   * Configure the price/discount part of the product info
   * @param {Object} discountInfo
   * @returns {HTMLElement}
   */
  const getBottomRight = (discountInfo) => {
    const documentFragment = document.createDocumentFragment();

    // top level element
    const pdpButtonWrap = document.createElement('div');
    pdpButtonWrap.classList.add('pdp-price-button-wrap');
    const pdpPriceButtonDiv = document.createElement('div');
    pdpPriceButtonDiv.classList.add('pdp-price-button');
    const addToCartButton = createAddToCartButton();

    const icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-circle-arrow-right');
    icon.setAttribute('style', 'padding-left: 10px;');
    addToCartButton.appendChild(icon);

    pdpPriceButtonDiv.appendChild(addToCartButton);
    const discountNodes = createDiscountNodes(discountInfo);
    pdpButtonWrap.append(discountNodes, pdpPriceButtonDiv);
    documentFragment.appendChild(pdpButtonWrap);

    // top level element
    const errorBlock = createErrorBlock();
    documentFragment.appendChild(errorBlock);

    return documentFragment;
  };

  /**
   * Get the rightmost section of the inline selector that contains price and discount
   * @param {Object} discountInfo
   * @returns {HTMLElement}
   */
  const getPDPOptions = (discountInfo) => {
    const documentFragment = document.createDocumentFragment();

    // top level element
    const pdpButtonWrap = document.createElement('div');
    pdpButtonWrap.classList.add('pdp-price-button-wrap');
    const pdpPriceButtonDiv = document.createElement('div');
    pdpPriceButtonDiv.classList.add('pdp-price-button');
    const addToCartButton = createAddToCartButton('Enroll');
    pdpPriceButtonDiv.appendChild(addToCartButton);
    const discountNodes = createDiscountNodes(discountInfo);
    pdpButtonWrap.append(discountNodes, pdpPriceButtonDiv);
    documentFragment.appendChild(pdpButtonWrap);

    // top level element
    const errorBlock = createErrorBlock();
    documentFragment.appendChild(errorBlock);

    return documentFragment;
  };

  /**
   * Try adding to Shopify cart and tracking the event in the data layer
   * @param {Object} product The Shopify product
   * @param {Object} moduleData Parsed module
   * @param {Object} selectedOptions Currently selected options object
   */
  const tryAddAndTrack = async (product, moduleData, selectedOptions) => {
    try {
      const variant = await addToCart(product, moduleData, selectedOptions);

      if (variant) {
        trackAddToCart(variant, moduleData, product);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Determine and configure the primary button for the dropdown
   */
  const configureHeaderForNoCohorts = (
    product,
    moduleData,
    selectedOptions,
  ) => {
    const enrollButtonWrapper = document.querySelector('.enroll-btn-wrapper');
    const button = createAddToCartButton();
    button.classList.add(
      'pdp-sticky-btn-right',
      'primary-button',
      'arrow-link',
      'arrow-link-forward',
    );

    button.addEventListener('click', () => {
      tryAddAndTrack(product, moduleData, selectedOptions);
    });

    enrollButtonWrapper.replaceChildren(button);
  };

  /**
   * Updates selectedOptions and show/hide buttons when an attribute is changed.
   */
  const handleSelectorChangeFull = (
    moduleData,
    product,
    selectedOptions,
    optionKeys,
    discountInfo,
    valuesMapByOptionName,
  ) => {
    const { showStickyHeader, showInlineSection } = moduleData;
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const availableVariants = IIN.shopify.getAvailableVariants(variants);
    const hasCohorts = availableVariants.length > 1;
    const { options, newSelection } = getOptions(
      selectedOptions,
      optionKeys,
      variants,
    );

    optionKeys.forEach((optionKey) => {
      selectedOptions[optionKey] = newSelection[optionKey];
    });

    // Configure options radio selections
    const optionsForm = document.createElement('form');
    const valueSet = options[optionKeys[0]];
    const title = [...valueSet]?.[0];
    const isDefaultTitle = title === 'Default Title';
    optionsForm.classList.add('jd-shopify-options');

    // Not showing options if there is only 1 default field
    if (!isDefaultTitle) {
      optionsForm.appendChild(
        createOptionNodes(
          optionKeys,
          options,
          selectedOptions,
          valuesMapByOptionName,
        ),
      );
    }

    // Instead of converting node list to an array, we can use forEach to iterate
    const { forEach } = Array.prototype;

    // Adding options to header dropdown
    const bottomBases = document.getElementsByClassName('pdp-bottom-options');
    forEach.call(bottomBases, (element) => {
      element.replaceChildren(optionsForm.cloneNode(true));
    });

    const bottomPrices = document.getElementsByClassName('pdp-bottom-price');
    forEach.call(bottomPrices, (element) =>
      element.replaceChildren(getBottomRight(discountInfo)),
    );

    // Adding options to inline block
    if (showInlineSection) {
      const pdpOptions = document.querySelector('.pdp-options');
      const parentDuplicate = optionsForm.cloneNode(true);
      pdpOptions.replaceChildren(parentDuplicate, getPDPOptions(discountInfo));
    }

    // Option click checkbox
    const radioSelector = `.jd-shopify-option-wrap input[type=radio]`;

    $(radioSelector).change(function (event) {
      event.preventDefault();

      const type = $(this).attr('name');
      const val = $(this).val();

      // This seems broken: parent, a special jquery data property, is always undefined?
      const parent = $(this).data('parent');

      selectedOptions[type] = val;

      handleSelectorChangeFull(
        moduleData,
        product,
        selectedOptions,
        optionKeys,
        discountInfo,
        valuesMapByOptionName,
      );

      const prefix = `.${parent}`;
      const checkedSelector = `${prefix} .jd-shopify-option-wrap input[name="${type}"]:checked`;
      $(checkedSelector).first().focus();
    });

    // This has something to do with targeting the right set of inputs
    if (showStickyHeader) {
      $('.jd-shopify-option-wrap label').click(function (event) {
        event.preventDefault();
        const checkbox = $(this).attr('for');
        $(`[id="${checkbox}"`).first().trigger('click');
      });
    }

    if (showStickyHeader && !hasCohorts) {
      // Button is replaced without disabled attribute
      configureHeaderForNoCohorts(product, moduleData, selectedOptions);
    } else {
      document
        .querySelector('.pdp-sticky #pdp-sticky-enroll-btn')
        ?.removeAttribute('disabled');
    }

    // Add to cart button click.
    const addToCartSelector = `.jd-shopify-add-btn`;
    const $addToCartButtons = $(addToCartSelector);

    $addToCartButtons.click(() => {
      tryAddAndTrack(product, moduleData, selectedOptions);
    });
  };

  /**
   * Updates selectedOptions and show/hide buttons when an attribute is changed.
   */
  const handleSelectorChangeBasic = (
    moduleData,
    product,
    selectedOptions,
    optionKeys,
  ) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const { options, newSelection } = getOptions(
      selectedOptions,
      optionKeys,
      variants,
    );

    optionKeys.forEach((optionKey) => {
      selectedOptions[optionKey] = newSelection[optionKey];
    });

    // Configure options radio selections
    const valueSet = options[optionKeys[0]];
    const title = [...valueSet]?.[0];
    const isDefaultTitle = title === 'Default Title';

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('jd-shopify-options');

    if (!isDefaultTitle) {
      optionsDiv.appendChild(
        createOptionNodes(optionKeys, options, selectedOptions),
      );
    }

    const button = createAddToCartButton();
    const errorMessage = createErrorBlock();

    // final composition
    const idSelector = `#${moduleData.name}`;
    const base = document.querySelector(idSelector);
    base.replaceChildren(optionsDiv, button, errorMessage);

    // Option click checkbox
    const radioSelector = `${idSelector} .jd-shopify-option-wrap input[type=radio]`;

    $(radioSelector).change(function () {
      const type = $(this).attr('name');
      const val = $(this).val();

      selectedOptions[type] = val;

      handleSelectorChangeBasic(
        moduleData,
        product,
        selectedOptions,
        optionKeys,
      );

      const checkedSelector = `${idSelector} .jd-shopify-option-wrap input[name="${type}"]:checked`;
      $(checkedSelector).first().focus();
    });

    // Add to cart button click.
    const addToCartSelector = `${idSelector} .jd-shopify-add-btn`;
    const $addToCartButtons = $(addToCartSelector);

    $addToCartButtons.click(() => {
      tryAddAndTrack(product, moduleData, selectedOptions);
    });
  };

  /**
   * Configure dropdown heading text
   * @param {number} optionsCounts
   */
  const configureDropdownHeading = (optionsCount) => {
    document
      .querySelector(
        optionsCount > 1
          ? '.pdp-sticky__dropdown-heading .single-variant'
          : '.pdp-sticky__dropdown-heading .multi-variant',
      )
      ?.remove();
  };

  /**
   * Clear or replace text in PDP bottom section for no cohort products
   * Not ideal, but there is already a dependency between the two modules:
   * PDP Bottom Section module grabs html from this module
   */
  const matchPDPBottomSectionToTop = (optionsCount) => {
    const heading = document.querySelector('.pdp-sticky__dropdown-heading');

    if (!heading) {
      return;
    }

    const targetHeading = document.querySelector('.pdp-bottom-middle-head');

    if (!targetHeading) {
      return;
    }

    const targetText = optionsCount ? heading.innerText.trim() : '';

    targetHeading.innerText = targetText;
  };

  return {
    calculateDiscounts,
    configureAddedToCartPopUp,
    configureDropdownHeading,
    configureHeaderToggle,
    configureImageSlider,
    configureStickyHeaderSampleClass,
    configureStickyNav,
    createViewItemEvent,
    getProductData,
    handleSelectorChangeBasic,
    handleSelectorChangeFull,
    matchPDPBottomSectionToTop,
    parseMarkupData,
    processProduct,
  };
};
