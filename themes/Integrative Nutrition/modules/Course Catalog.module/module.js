function extractItemData(course, index) {
  const discountPrice = course.price || 'NA';
  const actualPrice = course.actual_price || 'NA';
  return {
    item_id: course.product_id.includes(',')
      ? [course.product_id]
      : course.product_id,
    item_name: course.name,
    item_type: course.course_topics[0].label,
    variant_id: 'NA',
    price: parseFloat(discountPrice.replace(/[$,]/g, '') || 'NA'),
    actual_price: parseFloat(actualPrice.replace(/[$,]/g, '') || 'NA'),
    sku: course.sku || 'NA',
    index,
  };
}

function startViewCatalog(rowsData) {
  if (!rowsData) {
    return;
  }
  try {
    const items = rowsData.map((course, index) =>
      extractItemData(course, index),
    );

    if (items.length) {
      // Sending event only in case catalog elements exists
      const viewItemsList = {
        event: 'view_item_list',
        ecommerce: {
          item_list_name: 'view_catalog_name',
          item_list_id: 'view_catalog_id',
          items,
        },
      };
      triggerECommEvent(viewItemsList);
    }
  } catch (error) {
    console.error(error);
  }
}

function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return (style.display !== 'none' && style.visibility !== 'hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('shopifyDataLoaded', () => {
    // Select all instances of the course-catalog module on the page
    const courseCatalogs = document.querySelectorAll('.course-catalog');
    // Iterate over each module instance and send event
    courseCatalogs.forEach((catalog) => {
      if (isElementVisible(catalog)) {
        startViewCatalog(JSON.parse(catalog.getAttribute('data-rows')));
      }
    });
  });
});
