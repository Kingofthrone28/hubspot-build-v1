(async function () {
  const {
    calculateDiscounts,
    configureAddedToCartPopUp,
    configureDropdownHeading,
    configureHeaderToggle,
    configureImageSlider,
    configureStickyHeaderSampleClass,
    configureStickyNav,
    createViewItemEvent,
    getProductData,
    handleSelectorChangeFull,
    matchPDPBottomSectionToTop,
    parseMarkupData,
    processProduct,
  } = getProductSelectionMethods();

  /** Fix header to the top of the page */
  const makeHeaderFixed = () => {
    document
      .querySelector('.pdp-sticky-wrap')
      .classList.add('pdp-sticky-wrap-fixed');
  };

  try {
    const moduleData = parseMarkupData();
    const {
      isHeaderOnly,
      isInlineAndHeader,
      isSampleClass,
      name,
      productID,
      showInlineSection,
      useDynamicHeaderTrigger,
    } = moduleData;

    if (isInlineAndHeader || isHeaderOnly) {
      configureStickyNav();
      configureHeaderToggle(isHeaderOnly, useDynamicHeaderTrigger);
      makeHeaderFixed();
    }

    if (showInlineSection) {
      configureImageSlider();
    }

    if (isSampleClass) {
      configureStickyHeaderSampleClass();
      configureAddedToCartPopUp();
    }

    const query = IIN.shopify.getHCTPQuery(productID);
    const result = await IINShopifyClient.graphQLClient.send(query);
    const product = result?.model?.products?.[0];

    if (!product) {
      console.error(`Failed to find product for id: ${productID}`)
      return;
    }

    IIN.shopify.updateHCTPForV1(product)

    const optionsCount = IIN.shopify.getOptionsCount(product);
    configureDropdownHeading(optionsCount);
    matchPDPBottomSectionToTop(optionsCount);
    const { productOptions, variantSelections } = processProduct(product);
    const availableVariants = IIN.shopify.getAvailableVariants(product);
    const firstVariant = availableVariants?.[0];
    const discountInfoPromise = calculateDiscounts(firstVariant);

    // Parse Shopify metaobjects for option descriptions
    const optionsDescriptions = product.metafields?.[3].value;
    const metaObjectIDs = JSON.parse(optionsDescriptions)
    const metaObjectPromises = metaObjectIDs.map(IIN.shopify.getMetaObject)

    // Parallelize network requests
    const requests = [
      discountInfoPromise,
      ...metaObjectPromises,
    ];

    const results = await Promise.allSettled(requests)
    const unwrapped = results.map(({ status, value, reason }) => {
      return status === 'fulfilled' ? value : reason
    });

    const [discountInfo, ...metaObjectResults] = unwrapped;

    // Process metaobjects
    const metaObjects = metaObjectResults.map(value => value?.model.metaobject)
    const optionIDNameTuple = product.options.map(({ id, name }) => [id, name])
    const optionIDNameMap = new Map(optionIDNameTuple)
    const optionNameToDescriptionsMap = metaObjects.reduce((map, { fields }) => {
      const combined = Object.fromEntries(fields.map(({ key, value }) => [key, value]))
      const id = combined.option_id;
      const name = optionIDNameMap.get(id);

      if (!map.has(name)) {
        return map.set(name, [combined])
      }

      map.get(name).push(combined)
      return map
    }, new Map())

    console.log('new map', optionNameToDescriptionsMap)

    const addDescriptions = () => {
      const { forEach } = Array.prototype;
      const moduleElement = document.getElementById(`${name}`)
      const options = moduleElement.getElementsByClassName('jd-buy-option')
      forEach.call(options, (option) => {
        const optionName = option.dataset.optionName;
        const optionDescriptions = optionNameToDescriptionsMap.get(optionName)
        if (!optionDescriptions) {
          return;
        }

        const inputs = option.querySelectorAll('input')
        forEach.call(inputs, (input, index) => {
          if (!input.getAttribute('checked')) {
            return;
          }

          const { description } = optionDescriptions[index];
          const paragraph = document.createElement('p')
          paragraph.classList.add('option-description')
          const text = document.createTextNode(description)
          paragraph.appendChild(text);
          option.appendChild(paragraph)
        })
      })
    };

    handleSelectorChangeFull(
      moduleData,
      product,
      variantSelections,
      productOptions,
      discountInfo,
      addDescriptions,
    );

    createViewItemEvent(product, firstVariant, moduleData);
  } catch (error) {
    console.error(error);
  }
})();
