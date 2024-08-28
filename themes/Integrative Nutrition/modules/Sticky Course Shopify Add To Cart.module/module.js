(async function () {
  const {
    calculateDiscounts,
    configureAddedToCartPopUp,
    configureDropdownHeading,
    configureHeaderOffset,
    configureHeaderToggle,
    configureImageSlider,
    configureStickyHeaderSampleClass,
    configureStickyNav,
    createViewItemEvent,
    getProductData,
    handleSelectorChange,
    matchPDPBottomSectionToTop,
    parseMarkupData,
    processProduct,
  } = getProductSelectionMethods();

  try {
    const moduleData = parseMarkupData();

    if (moduleData.isInlineAndHeader) {
      configureStickyNav();
      configureImageSlider();
      configureHeaderToggle();
    }

    if (moduleData.isSampleClass) {
      configureStickyHeaderSampleClass();
      configureHeaderOffset();
      configureAddedToCartPopUp();
    }

    const product = await getProductData(moduleData.productID);
    const optionsCount = IIN.shopify.getOptionsCount(product);
    configureDropdownHeading(optionsCount);
    matchPDPBottomSectionToTop(optionsCount);
    const { productOptions, variantSelections } = processProduct(product);
    const availableVariants = IIN.shopify.getAvailableVariants(product);
    const firstVariant = availableVariants?.[0];
    const discountInfo =
      moduleData.showStickyHeader && firstVariant
        ? await calculateDiscounts(firstVariant)
        : undefined;

    handleSelectorChange(
      moduleData,
      product,
      variantSelections,
      productOptions,
      discountInfo,
    );

    createViewItemEvent(product, firstVariant, moduleData);
  } catch (e) {
    console.error(e);
  }
})();
