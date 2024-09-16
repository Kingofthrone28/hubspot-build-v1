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
