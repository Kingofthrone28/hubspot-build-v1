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

    const result = await IIN.shopify.sendProductQuery(productID);
    const product = result.model?.products?.[0];

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
    const { value: metaObjectIDsString } = IIN.shopify.getOptionsInfo(product.metafields)
    const metaObjectIDs = JSON.parse(metaObjectIDsString)
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

    // Process meta-objects
    const getValueDataByOptionName = (options, valueData) => {
      const optionTuples = options.map(({ id, name, values }) => {
        return [id, { name, values }]
      });

      const optionInfoByID = new Map(optionTuples);
      return valueData?.reduce((map, { fields }, index) => {
        if (!fields) {
          return map;
        }

        const dataTuples = fields.map(({ key, value }) => [key, value])
        const metaData = Object.fromEntries(dataTuples)

        // `option_id` must match the Shopify metaobject field name
        const { option_id } = metaData;
        const { name, values } = optionInfoByID.get(option_id);

        // Match metadata to option value by index
        const { value } = values[index];

        if (!map.has(name)) {
          map.set(name, new Map())
        }

        map.get(name).set(value, metaData)
        return map
      }, new Map())
    };

    const valueDataByOptionName = getValueDataByOptionName(
      product.options,
      metaObjectResults.map(value => value?.model.metaobject)
    );

    handleSelectorChangeFull(
      moduleData,
      product,
      variantSelections,
      productOptions,
      typeof discountInfo === 'string' ? {} : discountInfo,
      valueDataByOptionName,
    );

    createViewItemEvent(product, firstVariant, moduleData);
  } catch (error) {
    console.error(error);
  }
})();
