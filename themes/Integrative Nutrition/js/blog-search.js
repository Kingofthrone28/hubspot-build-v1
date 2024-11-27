(() => {
  /**
   * @file Search functionality with animation and dynamic content rendering
   * @module SearchModule
   */

  /**
   * A reference to the container for search results listings.
   * @type {HTMLElement|null}
   */
  const blockSelector = 'blog-search-term';
  const contentNodes = document.querySelectorAll(
    '.blog-page__container > div:not(#hs_cos_wrapper_blog-category-search):not(.blog-category-search-container)',
  );
  const listingWrapper = document.querySelector(`.${blockSelector}__listing`);
  const menuItems = document.querySelector(`.${blockSelector}__menu`);
  const searchDelay = 500;
  const searchForm = document.getElementById(`${blockSelector}__form`);
  const searchInput = document.querySelector(`.${blockSelector}__input`);
  const searchKeystrokeLimit = 3;
  const searchResultsPill = document.querySelector(
    `.${blockSelector}__pill-container`,
  );
  const searchButton = document.querySelector(`.${blockSelector}__button`);
  const cancelButton = document.querySelector(`.${blockSelector}__cancel`);
  const cancelBackButton = document.querySelector(
    `.${blockSelector}__cancel-previous`,
  );
  const searchResultsCount = document.querySelector(
    `.${blockSelector}__results-count`,
  );
  const searchResultsCountTitle = document.querySelector(
    `.${blockSelector}__results-count-title`,
  );
  const searchTermResultsTitle = document.querySelector(
    `.${blockSelector}__results-term`,
  );
  const searchResultsViewMore = document.querySelector(
    `.${blockSelector}__more.view-more`,
  );
  const searchResultsLoadPosts = document.querySelector(
    `.${blockSelector}__more.load-results`,
  );

  const searchWrapper = document.querySelector(`.${blockSelector}__wrapper`);
  const termContainer = document.querySelector(`.${blockSelector}`);
  const { updateClasses } = IIN.helpers;
  let searchQueryOffset = 5;
  const searchQueryLimit = 6;

  // Utilizing `New Set` for faster operations of large data sets when checking and storing unique values.
  const checkSearchPostIds = new Set();

  /**
   * Shows or hides the search button based on input length.
   * @param {string} searchTermValue - The current value of the search input.
   */
  const toggleSearchButtonVisibility = (searchTermValue) => {
    if (searchKeystrokeLimit <= searchTermValue.length) {
      updateClasses(searchButton, 'add', ['visible']);
      updateClasses(cancelButton, 'remove', ['visible']);
      updateClasses(cancelBackButton, 'remove', ['visible']);
    } else {
      updateClasses(searchButton, 'remove', ['visible']);
      updateClasses(cancelButton, 'add', ['visible']);
      updateClasses(cancelBackButton, 'add', ['visible']);
    }
  };

  /**
   * Animates the search bar by adding appropriate classes to show search input and hide the menu.
   */
  const animateExpandSearchBar = () => {
    const searchTermValue = searchInput.value.trim();
    if (menuItems) {
      updateClasses(menuItems, 'add', ['hide']);
      updateClasses(searchWrapper, 'add', ['visible']);
      updateClasses(termContainer, 'add', ['visible']);
      updateClasses(cancelButton, 'add', ['visible']);
      updateClasses(cancelBackButton, 'add', ['visible']);
    }
    if (searchKeystrokeLimit <= searchTermValue.length) {
      updateClasses(cancelButton, 'remove', ['visible']);
      updateClasses(cancelBackButton, 'remove', ['visible']);
    }
  };

  /**
   * Cancel the search bar input is clicked by removing classes and focusing out.
   * Cancel on full search page will redirect user back to previous page
   */
  const animateCancelSearchBar = () => {
    if (searchInput) {
      searchInput.value = '';
      searchResultsPill.innerHTML = '';
      updateClasses(searchWrapper, 'remove', ['visible']);
      updateClasses(termContainer, 'remove', ['visible']);
      updateClasses(menuItems, 'remove', ['hide']);
      updateClasses(cancelButton, 'remove', ['visible']);
      updateClasses(cancelBackButton, 'remove', ['visible']);

      if (cancelBackButton) {
        window.history.back();
      }
    }
  };

  /**
   * Filters results to exclude duplicate post by `id` and updates the checkSearchPostIds set.
   * @param {Object[]} results - An array of search result objects.
   * @returns {Object[]} The filtered array of new results.
   */
  const filterNewResults = (results) => {
    const filterResults = results.filter(
      (result) => !checkSearchPostIds.has(result.id),
    );
    filterResults.forEach((result) => checkSearchPostIds.add(result.id));
    return filterResults;
  };

  /**
   * Generates HTML markup for the search results.
   * @param {Object} result - A search result object.
   * @returns {string} The generated HTML markup.
   */
  const generateSearchResultHTML = (result) => {
    const {
      authorFullName = 'Unknown Author',
      description = 'No description available',
      featuredImageUrl = 'https://placehold.jp/200x160.jpg',
      id = 'no Id',
      tags = [],
      title = '',
      url = '',
    } = result;

    /**
     * Title to create div node of data results.title
     * used as a workaround to escape HTML characters
     */
    const titleHtml = `${title || ''}`;
    let titleText = '';

    if (titleHtml) {
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = titleHtml;
      titleText = titleDiv.textContent;
    }

    const tagName = tags[0];
    const tagUrl = IIN.blog.tagMap[tagName];

    return `
      <div class="${blockSelector}__item">
        ${url ? `<a href="${url}" class="${blockSelector}__image" style="background-image: url('${featuredImageUrl}')" aria-label="${titleText}"></a>` : ``}
        <div class="${blockSelector}__content">
          ${tagUrl ? `<a href="${tagUrl}" class="${blockSelector}__category">${tagName}</a>` : ``}
          <h3 class="${blockSelector}__title">
            ${url ? `<a href="${url}">${title}</a>` : title}
          </h3>
          <div class="${blockSelector}__byline">${authorFullName} | 
            <span id="read-time-${id}">loading...</span>
          </div>
          ${description ? `<div class="${blockSelector}__description">${description}</div>` : ``}
        </div>
      </div>
    `;
  };

  /**
   * Appends view more results.
   * @param {Object[]} [results=[]] - An array of search result objects.
   * @returns {void}
   */
  const appendViewMoreResults = (results = []) => {
    let row = '';
    const newResults = filterNewResults(results);
    newResults.forEach((result) => {
      row += generateSearchResultHTML(result);
    });
    if (row) {
      listingWrapper.insertAdjacentHTML('beforeend', row);
    }
  };

  /**
   * Generates search results HTML.
   * @param {Object[]} [results=[]] - An array of search result objects.
   * @returns {string}
   */
  const getSearchHtml = (results = []) => {
    let html = '';
    results.forEach((result) => {
      html += generateSearchResultHTML(result);
    });
    return html;
  };

  const isSpaceOnly = (event) => event.data === ' ';
  const isBackward = (event) => event.inputType === 'deleteContentBackward';

  /**
   * Hides content when preview search results are visible.
   */
  const hideContent = () => {
    contentNodes.forEach((node) => {
      node.classList.add('hidden');
    });
  };

  /**
   * Shows content when preview search results are hidden.
   */
  const showContent = () => {
    contentNodes.forEach((node) => {
      node.classList.remove('hidden');
    });
  };

  /**
   * Resets the body content by clearing listing wrapper and deactivating classes.
   */
  const resetBodyContent = () => {
    listingWrapper.innerHTML = '';
    searchResultsPill.innerHTML = '';
    console.log('Search results cleared');
    if (listingWrapper && searchResultsViewMore) {
      updateClasses(searchResultsViewMore, 'remove', ['visible']);
    }
    updateClasses(searchResultsLoadPosts, 'remove', ['visible']);
    showContent();
  };

  /**
   * Handle escape key press to reset content.
   * Triggers when the search input is focused.
   * @param {KeyboardEvent} event
   */
  const handleEscape = (event) => {
    if (event.key === 'Escape' && document.activeElement === searchInput) {
      resetBodyContent();
    }
  };

  /**
   * Handle input event on search field, resetting content if input is empty.
   * @param {Event} event
   */
  const handleExit = (event) => {
    if (event.target.value.trim() === '') {
      resetBodyContent();
    }
  };

  /**
   * Fetches the content of a blog post from the provided URL.
   * @param {Object} result - The result object containing the URL.
   * @returns {Promise<string|null>} The content of the post or null if an error occurs.
   */
  const fetchPostContent = async (result) => {
    try {
      const response = await fetch(result.url);
      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status: ${response.status}`,
        );
      }
      return await response.text();
    } catch (error) {
      console.error('fetchPostContent Fetch error:', error);
      return null;
    }
  };

  /**
   * Generalized function to fetch data from the API
   * @param {string} searchTerm
   * @param {number} [offset=0]
   * @param {number} [limit=6]
   * @returns {Promise<Object|null>} The content of the post, or null if an error occurs.
   */
  const fetchDataFromAPI = async (searchTerm, offset = 0, limit = 6) => {
    try {
      const baseUrl = new URL(`${window.location.origin}/_hcms/search`);
      baseUrl.searchParams.set('term', searchTerm);
      baseUrl.searchParams.set('type', 'BLOG_POST');
      baseUrl.searchParams.set('limit', limit);
      baseUrl.searchParams.set('offset', offset);

      const response = await fetch(baseUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  /**
   * Processes HTML content to calculate and display read-time estimates.
   * @param {string} htmlContent - The HTML content of a post.
   * @param {string} resultId - The ID of the result for which to calculate read-time.
   */
  const processParagraphs = (htmlContent, resultId) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const paragraphs = doc.querySelectorAll('.jd-post-content');
    console.info(`Processing paragraphs for result ID: ${resultId}`);
    let wordCount = 0;

    paragraphs.forEach((paragraph) => {
      const paragraphText = paragraph.textContent;
      wordCount += paragraphText.split(/\s+/).length;
    });

    const wordsPerMinute = 200;
    const readTime = Math.ceil(wordCount / wordsPerMinute); // Estimate read time (200 words/min)
    const formattedReadTime =
      readTime <= 1
        ? 'Read time: less than 1 min'
        : `Read time: ${readTime} mins`;

    // Find and update the read-time span in the document
    const readTimeElement = document.querySelector(`#read-time-${resultId}`);
    if (readTimeElement) {
      readTimeElement.innerHTML = formattedReadTime;
    }
  };

  /**
   * Fetches and populates read-time estimates for search results.
   * @param {Object[]} results - An array of search result objects.
   */
  const populateReadTimes = async (results) => {
    try {
      const fetchPromises = results.map((result) => fetchPostContent(result));
      const data = await Promise.all(fetchPromises);

      data.forEach((content, index) => {
        if (content) {
          processParagraphs(content, results[index].id);
        }
      });
    } catch (error) {
      console.error('populateReadTimes An unexpected error occurred:', error);
    }
  };

  /**
   * Sets and renders search results in the listing container.
   * @param {Object[]} results - An array of search result objects.
   * @param {number} total - The total number of search results.
   */
  const getSearchPosts = (results, total) => {
    if (listingWrapper) {
      listingWrapper.innerHTML = getSearchHtml(
        results.slice(0, searchQueryOffset),
      );

      if (searchResultsViewMore) {
        updateClasses(searchResultsViewMore ?? searchResultsLoadPosts, 'add', [
          'visible',
        ]);
      } else {
        updateClasses(searchResultsLoadPosts, 'add', ['visible']);
      }
    }

    // Populate read times for each post. This is an unawaited async function.
    populateReadTimes(results);

    // Update the search results count or clear it if the search input is empty
    if (searchResultsCount) {
      searchResultsCount.textContent = total || '0';
      searchResultsCountTitle.innerHTML =
        searchResultsCount?.textContent === '1' ? 'result' : 'results';
    }

    hideContent();
    document.addEventListener('keydown', handleEscape);
    searchInput?.addEventListener('input', handleExit);
  };

  /**
   * Handles search results loading.
   * @returns {Promise<void>}
   */
  const handleSearchResultsLoadPosts = async () => {
    const searchTermValue = searchInput.value.trim();
    try {
      const data = await fetchDataFromAPI(
        searchTermValue,
        searchQueryOffset,
        searchQueryLimit,
      );

      const dataResults = data?.results;

      if (dataResults) {
        const searchResultsLimit = data.results.slice(0, searchQueryLimit);

        // Ensure only a set number of results are appended
        appendViewMoreResults(searchResultsLimit);

        console.log(`Fetched ${data.results.length} posts in this batch`);

        // Call populateReadTimes after appending the results
        populateReadTimes(searchResultsLimit);

        searchQueryOffset += searchQueryLimit;

        // some batches of data will have results less than query limit based
        // on the number of term tags returned in last payload request
        // set safety check for empty results array(!dataResults) if not less than query limit
        if (dataResults?.length < searchQueryLimit || !dataResults) {
          updateClasses(searchResultsLoadPosts, 'remove', ['visible']);
        }
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      // You can also add UI feedback for the user, such as displaying an error message
    }
  };

  /**
   * Fetches search results based on the search term.
   * @param {string} searchTermValue - The search term entered by the user.
   * @param {number} [numberOfItems=0] - The number of items to return.
   */
  const fetchSearchResults = async (searchTermValue, numberOfItems = 0) => {
    try {
      const data = await fetchDataFromAPI(searchTermValue, numberOfItems);

      if (!data || !data.results) {
        console.warn('No results or data is null');
        return;
      }

      const searchTermValueMatch = data?.searchTerm;

      if (data?.results) {
        getSearchPosts(data.results, data.total);
      }

      searchQueryOffset += numberOfItems;

      if (searchTermValueMatch !== searchTermValue) {
        updateClasses(searchResultsViewMore, 'remove', ['visible']);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  /**
   * Updates the search result message based on the number of results.
   */
  const updateSearchResultMessage = () => {
    const searchTitleNoResults = document.querySelector(
      `.${blockSelector}__results-title`,
    );
    const searchNoResultsBox = document.querySelector(
      `.${blockSelector}__no-results-box`,
    );
    const delay = 200;

    // Check if elements exist
    if (!searchTitleNoResults || !searchNoResultsBox) {
      console.warn(
        'Elements for search result message or no results box not found.',
      );
      return;
    }

    const noResults = searchResultsCount?.textContent === '0';
    const message = `${noResults ? 'No' : 'Search'} Results for`;

    // Update the message in the results title
    searchTitleNoResults.innerText = message;

    console.log('MESSAGE', message);

    // Toggle visibility of the no-results box and view more based on search results
    updateClasses(searchNoResultsBox, noResults ? 'add' : 'remove', [
      'visible',
    ]);

    // there's some timing issue between noResults and updateClasses utility
    // runs to wait for availability to remove visible
    setTimeout(() => {
      if (searchResultsLoadPosts) {
        updateClasses(searchResultsLoadPosts, noResults ? 'remove' : 'add', [
          'visible',
        ]);
      }
    }, delay);
  };

  // Function to update search results title based on remaining terms
  const updateSearchTermResultsTitle = (terms) => {
    // Join remaining terms with spaces or commas as needed
    searchTermResultsTitle.textContent = `"${terms.join(' ')}"`;
  };

  const removeSearchPill = async (term) => {
    const pill = document.querySelectorAll(`.${blockSelector}__pill`);
    const terms = searchInput.value.trim().split(/\s+/);
    const filterTerms = terms.filter((word) => word !== term);
    searchInput.value = filterTerms.join(' ');

    try {
      const pillItem = Array.from(pill).find((item) => item.innerText === term);
      if (pillItem) {
        pillItem.remove();
      }

      // Ensure the cancel button does not receive the .visible class
      updateClasses(cancelButton, 'remove', ['visible']);
      toggleSearchButtonVisibility(terms);

      // Fetch and update search results based on the updated input value only if a pill was removed
      if (filterTerms.length) {
        await fetchSearchResults(filterTerms.join(' '), searchQueryOffset);
      } else {
        resetBodyContent();
      }

      if (!filterTerms.length && searchResultsCount) {
        searchResultsCount.textContent = '0';
        searchTermResultsTitle.textContent = '""';
        updateSearchResultMessage();
      }
      updateSearchTermResultsTitle(filterTerms);
    } catch (error) {
      console.error('Error in removeSearchPill:', error);
    }
  };

  const createSearchPill = (terms) => {
    // Clear the container to avoid duplicate pills
    searchResultsPill.innerHTML = '';

    terms.forEach((term) => {
      const pill = document.createElement('button');
      const pillDelete = document.createElement('span');
      updateClasses(pill, 'add', [`${blockSelector}__pill`]);
      updateClasses(pillDelete, 'add', [`${blockSelector}__pill-delete`]);
      pill.innerText = term;

      pill.onclick = () => removeSearchPill(term);

      pill.appendChild(pillDelete);
      searchResultsPill.appendChild(pill);
    });
  };

  // Call  with terms from the query parameter on page load
  const loadPillsFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    if (query) {
      const terms = query.split(' ');
      createSearchPill(terms);
    }
  };

  /**
   * Redirects the user to the search results page with the provided term.
   * @param {string} term - The search term.
   */
  const redirectToSearchResults = (term) => {
    const newUrl = `/search-results?query=${encodeURIComponent(term)}`;
    window.location.href = newUrl;
  };

  /**
   * Executes the search results pagevfunctionality
   */
  const getAllSearchResults = async () => {
    const isSearchResultsPage =
      window.location.pathname.includes('/search-results');

    const getSearchTermFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('query');
    };

    const getSearchTermValue = (searchTermValue) => {
      if (searchTermValue) {
        redirectToSearchResults(searchTermValue);
      }
    };

    try {
      const searchTermUrlValue = getSearchTermFromURL();
      if (isSearchResultsPage && searchTermUrlValue) {
        const terms = decodeURIComponent(searchTermUrlValue).split(/\s+/);
        const joinTerms = terms.join(' ');

        searchInput.value = joinTerms;
        searchTermResultsTitle.innerHTML = `"${joinTerms}"`;
        createSearchPill(terms);
        await fetchSearchResults(joinTerms);
        searchInput?.addEventListener('input', (event) => {
          searchTermResultsTitle.innerHTML = `"${event.target.value}"`;
        });

        animateExpandSearchBar();
        searchInput.focus();
        await fetchSearchResults(searchTermUrlValue);
      }

      // Submit button redirect to search results page with term value
      searchForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        getSearchTermValue(searchInput.value.trim());
      });

      // View more button redirect to search results page with term value
      searchResultsViewMore?.addEventListener('click', (event) => {
        event.preventDefault();
        getSearchTermValue(searchInput.value.trim());
      });
    } catch (error) {
      console.error('Error in getAllSearchResults:', error);
    }
  };

  /**
   * Executes the teaser search functionality
   */
  const runSearch = IIN.helpers.debounce(async () => {
    const searchTermValue = searchInput.value.trim();

    if (!searchTermValue && searchResultsCount) {
      searchResultsCount.textContent = '0';
      updateSearchResultMessage();
      return;
    }

    if (searchKeystrokeLimit <= searchTermValue.length) {
      try {
        await fetchSearchResults(searchTermValue, searchQueryOffset);
        updateSearchResultMessage();
        createSearchPill(searchInput.value.split(/\s+/));
      } catch (error) {
        console.error('Error in runSearch:', error);
      }
    }
  }, searchDelay);

  window.onload = () => {
    searchInput?.addEventListener('input', (event) =>
      toggleSearchButtonVisibility(event.target.value.trim()),
    );
    [cancelButton, cancelBackButton].forEach((button) => {
      button?.addEventListener('click', animateCancelSearchBar);
    });
    searchResultsLoadPosts?.addEventListener(
      'click',
      handleSearchResultsLoadPosts,
    );
    searchInput?.addEventListener('focus', animateExpandSearchBar);
    searchInput?.addEventListener('input', (event) => {
      if (!isSpaceOnly(event) && !isBackward(event)) {
        runSearch();
      }
    });
    loadPillsFromQuery();
    getAllSearchResults();
  };
})();
