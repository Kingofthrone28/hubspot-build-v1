function extractItemData(course, index) {
    const discountPrice = course.price || 'NA';
    const actualPrice = course.actual_price || 'NA';
    return {
        item_id: (course.product_id.includes(',')) ? [course.product_id] : course.product_id,
        item_name: course.name,
        item_type: course.course_topics[0].label,
        variant_id: 'NA',
        price: parseFloat(discountPrice.replace(/[$,]/g, '') || 'NA'),
        actual_price: parseFloat(actualPrice.replace(/[$,]/g, '') || 'NA'),
        sku: course.sku || 'NA',
        index
    };
}

function startViewCatalog() {

    if (!rowsData) {
        return;
    }
    try {
        const items = rowsData.map((course, index) => extractItemData(course, index));

        const viewItemsList = {
            event: "view_item_list",
            ecommerce: {
                item_list_name: "view_catalog_name",
                item_list_id: "view_catalog_id",
                items
            }
        };
        triggerECommEvent(viewItemsList);
    } catch (error) {
        console.error(error);
    }

}

window.addEventListener("load", () => {
    startViewCatalog();
});
