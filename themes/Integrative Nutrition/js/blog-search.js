(() => {
  /**
   * @file Search functionality with animation and dynamic content rendering
   * @module SearchModule
   */

  /**
   * A reference to the container for search results listings.
   * @type {HTMLElement|null}
   */
  const listingResultsWrapper = document.querySelector(
    '.blog-search-term__listing-results',
  );
  const listingWrapper = document.querySelector('.blog-search-term__listing');
  const menuItems = document.querySelector('.blog-search-term__menu');
  const searchDelay = 500;
  const searchForm = document.getElementById('blog-search-term__form');
  const searchInput = document.querySelector('.blog-search-term__input');
  const searchResultsButton = document.querySelector(
    '.blog-search-term__button',
  );
  const searchResultsCancelButton = document.querySelector(
    '.blog-search-term__cancel',
  );
  const searchResultsCancelBackButton = document.querySelector(
    '.blog-search-term__cancel.previous',
  );
  const searchResultsCount = document.querySelector(
    '.blog-search-term__results-count',
  );
  const searchResultsViewMore = document.querySelector(
    '.blog-search-term__view-more',
  );
  const searchResultsLoadPosts = document.querySelector(
    '.blog-search-term__load-results',
  );

  const searchWrapper = document.querySelector('.blog-search-term__wrapper');
  const termContainer = document.querySelector('.blog-search-term');
  const { toggleClasses } = IIN.helpers;

  /**
   * Shows or hides the search button based on input length.
   * @param {string} searchTermValue - The current value of the search input.
   */
  const toggleSearchButtonVisibility = (searchTermValue) => {
    const searchKeystrokeLimit = 3;
    if (searchTermValue.length >= searchKeystrokeLimit) {
      toggleClasses(searchResultsButton, 'remove', ['hide']);
      toggleClasses(searchResultsButton, 'add', ['active']);
      toggleClasses(searchResultsCancelButton, 'add', ['hide']);
    } else {
      toggleClasses(searchResultsButton, 'add', ['hide']);
      toggleClasses(searchResultsButton, 'remove', ['active']);
      toggleClasses(searchResultsCancelButton, 'remove', ['hide']);
    }
  };

  /**
   * Animates the search bar by adding appropriate classes to show search input and hide the menu.
   */
  const animateSearchBar = () => {
    const searchTermValue = searchInput.value.trim();
    const searchKeystrokeLimit = 3;
    if (menuItems) {
      toggleClasses(menuItems, 'add', ['hide-menu']);
      toggleClasses(searchWrapper, 'add', ['active']);
      toggleClasses(termContainer, 'add', ['active']);
      toggleClasses(searchResultsCancelButton, 'remove', ['hide']);
    }
    if (searchTermValue.length >= searchKeystrokeLimit) {
      toggleClasses(searchResultsCancelButton, 'add', ['hide']);
    }
  };

  /**
   * Cancel the search bar input is clicked by removing classes and focusing out.
   */
  const animateCancelSearchBar = () => {
    //    handleHistoryCancelClick();
    if (searchInput) {
      searchInput.value = '';
      toggleClasses(searchWrapper, 'remove', ['active']);
      toggleClasses(termContainer, 'remove', ['active']);
      toggleClasses(menuItems, 'remove', ['hide-menu']);
      toggleClasses(searchResultsCancelButton, 'add', ['hide']);
    }
  };

  /**
   * Generates HTML markup for the search results.
   * @param {Object[]} results - An array of search result objects.
   * @returns {string} The generated HTML markup.
   */
   const getSearchHtml = (results = []) => {
    const numberOfItems = 5;
    let html = '';
    results
      .slice(0, numberOfItems)
      .forEach(
        ({
          authorFullName,
          description,
          featuredImageUrl,
          id,
          tags,
          title,
          url,
        }) => {
          const titleHtml = `${title}`;
          let titleText = '';
          /**
           * title to create div node of data results.title
           * used as a workaround to escape HTML characters
           */
          if (titleHtml) {
            const titleDiv = document.createElement('div');
            titleDiv.innerHTML = titleHtml;
            titleText = titleDiv.textContent;
          }

          html += `
            <div class="blog-search-term__item">
              <a href="${url}" class="blog-search-term__image" style="background-image: url('${featuredImageUrl}')" aria-label="${titleText}"></a>
              <div class="blog-search-term__content">
                ${tags.length ? `<a href="${url}" class="blog-search-term__category">${tags[0]}</a>` : ``}
                <h3 class="blog-search-term__title"><a href="${url}">${title}</a></h3>
                <div class="blog-search-term__byline">${authorFullName} | 
                  <span id="read-time-${id}">loading...</span>
                </div>
                <div class="blog-search-term__description">${description}</div>
              </div>
            </div>`;
        },
      );
    return html;
  };

  /**
   * Resets the body content by clearing listing wrapper and deactivating classes.
   */
  const resetBodyContent = () => {
    listingWrapper.innerHTML = '';
    console.log('Search results cleared');
    if (listingWrapper && searchResultsViewMore) {
      toggleClasses(searchResultsViewMore, 'remove', ['active']);
    } else {
      toggleClasses(searchResultsLoadPosts, 'remove', ['active']);
    }
  };

  /**
   * Handle escape key press to reset content.
   * triggers when the search input is focused.
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
   * @async
   * @param {Object} result - The result object containing the URL.
   * @returns {Promise<string|null>} The content of the post, or null if an error occurs.
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
   * @async
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

  searchResultsLoadPosts?.addEventListener('click', (event) => {
    console.log('Load more posts button clicked');
  });

  /**
   * Sets and renders search results in the listing container.
   * @param {Object[]} results - An array of search result objects.
   * @param {number} total - The total number of search results.
   */
  const getSearchPosts = (results, total) => {
    if (listingWrapper) {
      listingWrapper.innerHTML = getSearchHtml(results);
      if (searchResultsViewMore) {
        toggleClasses(searchResultsViewMore, 'add', ['active']);
      } else {
        toggleClasses(searchResultsLoadPosts, 'remove', ['active']);
      }
    }

    // Populate read times for each post
    populateReadTimes(results);

    // Update element with the value from results array {data.total}
    if (searchResultsCount && total) {
      searchResultsCount.textContent = total;
    }

    document.addEventListener('keydown', handleEscape);
    searchInput?.addEventListener('input', handleExit);
  };

  /**
   * Fetches search results based on the search term.
   * @async
   * @param {string} searchTermValue - The search term entered by the user.
   * @param {number} [numberOfItems] - The number of items to return.
   */
  const fetchSearchResults = async (searchTermValue, numberOfItems = 5) => {
    try {
      const baseUrl = new URL(`${window.location.origin}/_hcms/search`);
      baseUrl.searchParams.set('term', searchTermValue);
      baseUrl.searchParams.set('type', 'BLOG_POST');
      baseUrl.searchParams.set('limit', numberOfItems);

      const response = await fetch(baseUrl.href);
      const data = await response.json();

      if (data?.results) {
        getSearchPosts(data.results, data.total);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  /**
   * Redirects the user to the search results page with the provided term.
   * @param {string} term - The search term.
   */
  const redirectToSearchResults = (term) => {
    const newUrl = `/search-results?query=${encodeURIComponent(term)}`;
    window.location.replace(newUrl);
  };

  /**
   * Executes the search results pagevfunctionality
   */
  const getAllSearchResults = () => {
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

    if (isSearchResultsPage) {
      const searchTermUrlValue = getSearchTermFromURL();
      const searchTermResultsTitle = document.querySelector(
        '.blog-search-term__results-term',
      );
      if (searchTermUrlValue && searchTermResultsTitle) {
        searchInput.value = decodeURIComponent(searchTermUrlValue);
        searchTermResultsTitle.innerHTML = `"${searchTermUrlValue}"`;
        searchInput?.addEventListener('input', (event) => {
          searchTermResultsTitle.innerHTML = `"${event.target.value}"`;
        });

        animateSearchBar();
        searchInput.focus();
        fetchSearchResults(searchTermUrlValue);
      }
    }

    // submit button redirect to search results page with term value
    searchForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      getSearchTermValue(searchInput.value.trim());
    });

    // View more button redirect to search results page with term value
    searchResultsViewMore?.addEventListener('click', (event) => {
      console.log('REDIRECT BUTTON TRIGGER');
      event.preventDefault();
      getSearchTermValue(searchInput.value.trim());
    });
  };

  /**
   * Executes the teaser search functionality
   */
  const runSearch = () => {
    const searchTermValue = searchInput.value.trim();
    const searchKeystrokeLimit = 3;
    if (searchTermValue.length >= searchKeystrokeLimit) {
      fetchSearchResults(searchTermValue, 5);
    }
  };

  searchInput?.addEventListener('input', (event) =>
    toggleSearchButtonVisibility(event.target.value.trim()),
  );
  searchResultsCancelButton?.addEventListener('click', animateCancelSearchBar);
  searchInput?.addEventListener('focus', animateSearchBar);
  searchInput?.addEventListener(
    'input',
    IIN.helpers.debounce(runSearch, searchDelay),
  );
  getAllSearchResults();
})();
