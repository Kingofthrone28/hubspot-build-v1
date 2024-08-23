window.dataLayer = window.dataLayer || [];

function getSelectedFilters() {
  const selectedTopics = Array.from(
    document.querySelectorAll(
      '#course-pop-Topics input[name="Topics"]:checked',
    ),
  ).map((input) => input.value);
  const selectedLevels = Array.from(
    document.querySelectorAll(
      '#course-pop-Levels input[name="Levels"]:checked',
    ),
  ).map((input) => input.value);
  const selectedTypes = Array.from(
    document.querySelectorAll('#course-pop-Type input[name="Type"]:checked'),
  ).map((input) => input.value);
  return { selectedTopics, selectedLevels, selectedTypes };
}

function trackFilterEvent() {
  const { selectedTopics, selectedLevels, selectedTypes } =
    getSelectedFilters();
  window.dataLayer.push({
    event: 'filter',
    filter_topics: selectedTopics,
    filter_levels: selectedLevels,
    filter_type: selectedTypes,
  });
}

const saveButtonElement = document.getElementById('course-filter-save');

if (saveButtonElement) {
  saveButtonElement.addEventListener('click', () => {
    trackFilterEvent();
  });
}

function trackSearchResults(element) {
  const articleCount =
    document.querySelectorAll('.jd-listing-item').length || 0;
  window.dataLayer.push({
    event: 'search_results',
    search_term: element.value,
    search_result_count: articleCount,
  });
}

function trackViewSearchResults(element) {
  const titles = [];
  const articles = document.querySelectorAll(
    'article.jd-listing-item div.jd-listing-content h3',
  );
  articles.forEach((article) => {
    titles.push(article.innerText);
  });
  window.dataLayer.push({
    event: 'view_search_results',
    search_term: element.value,
    result_title: titles,
  });
}

const searchBoxElement = document.querySelector('#jd-blog-search-input');
if (searchBoxElement) {
  searchBoxElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      setTimeout(() => {
        trackSearchResults(searchBoxElement);
        trackViewSearchResults(searchBoxElement);
      }, 5000); // grace period for search results to process.
    }
  });
}
