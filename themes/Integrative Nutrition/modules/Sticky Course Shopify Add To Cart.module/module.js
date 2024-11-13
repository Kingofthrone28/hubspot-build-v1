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
    console.log('product', product)

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
    const getOptionNameToDescriptionMap = (productOptions, metaObjectsData) => {
      const metaObjects = metaObjectsData.map(value => value?.model.metaobject)
      const optionIDNameTuple = productOptions.map(({ id, name, values }) => {
        return [id, { name, values }]
      });

      const optionIDNameMap = new Map(optionIDNameTuple)
      return metaObjects.reduce((map, { fields }, index) => {
        const keyValueTuple = fields.map(({ key, value }) => [key, value])
        const combined = Object.fromEntries(keyValueTuple)

        // The `option_id` field must match the Shopify metaobject field
        const id = combined.option_id;
        const { name, values } = optionIDNameMap.get(id);
        const respectiveValue = values[index].value;

        if (!map.has(name)) {
          const optionMap = new Map();
          optionMap.set(respectiveValue, combined)
          return map.set(name, optionMap)
        }

        map.get(name).set(respectiveValue, combined)
        return map
      }, new Map())
    };

    const optionNameToDescriptionsMap = getOptionNameToDescriptionMap(product.options, metaObjectResults)
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
        forEach.call(inputs, (input) => {
          if (!input.getAttribute('checked')) {
            return;
          }

          const { description } = optionDescriptions.get(input.value);
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
