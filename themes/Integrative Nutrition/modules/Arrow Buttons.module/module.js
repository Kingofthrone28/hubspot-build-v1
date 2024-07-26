(() => {
  const $requestBtn = $(
    '#hs_cos_wrapper_module_1691081394813 .jd-request-btn, #hs_cos_wrapper_widget_1698770889044 .jd-request-btn',
  );
  const $requestSubItems = $('.jd-subitems');

  if (!$requestBtn) {
    return;
  }

  $requestBtn.click(() => {
    $requestSubItems.toggleClass('items');
    $requestBtn.toggleClass('active');
  });
})();
