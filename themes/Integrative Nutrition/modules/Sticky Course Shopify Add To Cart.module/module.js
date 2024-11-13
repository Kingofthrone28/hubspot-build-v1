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

  const log = console.log;

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

    const query = IIN.shopify.getHCTPQuery(productID);
    const result = await IINShopifyClient.graphQLClient.send(query);
    const product = result?.model?.products?.[0];

    if (!product) {
      console.error(`Failed to find product for id: ${productID}`)
      return;
    }

    IIN.shopify.updateHCTPForV1(product)
    log('gqlProduct', product)

    const optionsCount = IIN.shopify.getOptionsCount(product);
    configureDropdownHeading(optionsCount);
    matchPDPBottomSectionToTop(optionsCount);
    const { productOptions, variantSelections } = processProduct(product);
    const availableVariants = IIN.shopify.getAvailableVariants(product);
    const firstVariant = availableVariants?.[0];
    const discountInfo = await calculateDiscounts(firstVariant);

    handleSelectorChangeFull(
      moduleData,
      product,
      variantSelections,
      productOptions,
      discountInfo,
    );

    createViewItemEvent(product, firstVariant, moduleData);
    // const hctpMetaObjectID = 'gid://shopify/Metaobject/63623201066'
    const optionsDescriptions = product.metafields?.[3].value
    const arr = JSON.parse(optionsDescriptions)
    const promises = arr.map(IIN.shopify.getMetaObject)

    const values = await IIN.helpers.allResolved(promises)
    console.log('values', values)
  } catch (error) {
    console.error(error);
  }
})();
