/**
 * Show no results message on course catalog page,
 * as well as Chopra course catalog.
 */
document.querySelectorAll(`.course-catalog`).forEach((catalog) => {
  const visibleCourses = catalog.querySelectorAll(`.course-card-wrap`);

  if (visibleCourses.length) {
    return;
  }

  const { moduleName } = catalog.dataset;
  const alternate = document.querySelector(
    `.course-catalog-no-results[data-module-name="${moduleName}"]`,
  );

  $(alternate).show();
});
