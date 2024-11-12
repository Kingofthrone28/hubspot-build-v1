(async () => {
  const {
    getProductData,
    parseMarkupData,
    processProduct,
    handleSelectorChangeBasic,
  } = getProductSelectionMethods();

  try {
    const module = parseMarkupData();
    const product = await getProductData(module.productID);
    const { productOptions, variantSelections } = processProduct(product);
    if (productOptions.length === 0) return;
    handleSelectorChangeBasic(
      module,
      product,
      variantSelections,
      productOptions,
    );
  } catch (e) {
    console.error(e);
  }
})();
