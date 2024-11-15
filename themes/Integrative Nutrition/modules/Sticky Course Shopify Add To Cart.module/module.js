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

    const product = await IIN.shopify.sendProductQuery(productID);

    if (!product) {
      console.error(`Failed to find product for id: ${productID}`)
      return;
    }

    const optionsCount = IIN.shopify.getOptionsCount(product);
    configureDropdownHeading(optionsCount);
    matchPDPBottomSectionToTop(optionsCount);
    const { productOptions, variantSelections } = processProduct(product);
    const availableVariants = IIN.shopify.getAvailableVariants(product);
    const firstVariant = availableVariants?.[0];
    const discountInfoPromise = calculateDiscounts(firstVariant);
    const requests = [discountInfoPromise];

    // Parse Shopify metaobjects for option descriptions
    const optionsInfoResult = IIN.shopify.getOptionsInfo(product.metafields)
    if (optionsInfoResult) {
      const { value: metaObjectIDsString } = optionsInfoResult
      const metaObjectIDs = JSON.parse(metaObjectIDsString)
      const metaObjectPromises = metaObjectIDs.map(IIN.shopify.getMetaObject)
      requests.push(...metaObjectPromises)
    }

    // Parallelize network requests
    const results = await Promise.allSettled(requests)
    const unwrapped = results.map(({ status, value, reason }) => {
      return status === 'fulfilled' ? value : reason
    });

    const [discountInfo, ...metaObjectResults] = unwrapped;
    const valueDataByOptionName = IIN.shopify.getValueDataByOptionName(
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
